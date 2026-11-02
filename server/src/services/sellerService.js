import mongoose from 'mongoose';
import { Seller } from '../models/Seller.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const sellerService = {
  /**
   * Submit an application to become a verified marketplace seller.
   * Status defaults to 'pending' and requires administrator review.
   */
  applyForSeller: async (userId, { storeName, storeSlug, description = '', contactPhone = '', socialLinks = {} }) => {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User account not found');
    }

    if (user.role === 'seller' && user.sellerProfile) {
      const existingActive = await Seller.findById(user.sellerProfile);
      if (existingActive && existingActive.status === 'approved') {
        throw ApiError.conflict('You already have an active approved merchant profile');
      }
    }

    // Check if user already submitted a pending application
    const existingApplication = await Seller.findOne({ user: user._id });
    if (existingApplication && existingApplication.status === 'pending') {
      throw ApiError.conflict('A seller application is already pending administrator review');
    }

    const normalizedSlug = (storeSlug || storeName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Verify slug uniqueness against other merchants
    const slugTaken = await Seller.findOne({
      storeSlug: normalizedSlug,
      ...(existingApplication ? { _id: { $ne: existingApplication._id } } : {})
    });

    if (slugTaken) {
      throw ApiError.conflict(`Store slug '${normalizedSlug}' is already taken. Please choose another.`);
    }

    let seller;
    if (existingApplication) {
      // Re-apply if previously rejected
      existingApplication.storeName = storeName.trim();
      existingApplication.storeSlug = normalizedSlug;
      existingApplication.description = description.trim();
      existingApplication.contactPhone = contactPhone.trim();
      existingApplication.socialLinks = socialLinks;
      existingApplication.status = 'pending';
      existingApplication.rejectionReason = '';
      await existingApplication.save();
      seller = existingApplication;
    } else {
      seller = new Seller({
        user: user._id,
        storeName: storeName.trim(),
        storeSlug: normalizedSlug,
        description: description.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: user.email,
        socialLinks,
        status: 'pending'
      });
      await seller.save();
    }

    // Link application to user profile while preserving 'customer' role until admin approves
    user.sellerProfile = seller._id;
    await user.save();

    logger.info(`Seller application submitted for user "${user.name}" (Store: "${seller.storeName}")`);

    return {
      seller,
      status: 'pending',
      message: 'Seller application submitted successfully and is pending administrator review'
    };
  },

  /**
   * Get application status for authenticated user.
   */
  getApplicationStatus: async (userId) => {
    const seller = await Seller.findOne({ user: userId });
    if (!seller) {
      return {
        hasApplied: false,
        status: 'none',
        seller: null
      };
    }

    return {
      hasApplied: true,
      status: seller.status,
      seller
    };
  },

  /**
   * Get real-time seller dashboard statistics derived from verified database records.
   */
  getSellerDashboard: async (sellerProfileId) => {
    if (!sellerProfileId) {
      throw ApiError.forbidden('Seller profile ID is required');
    }

    const sellerObjId = new mongoose.Types.ObjectId(sellerProfileId.toString());

    // 1. Product & Inventory Metrics
    const products = await Product.find({ seller: sellerObjId });
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;

    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      const stock = Number(p.stock) || 0;
      totalStock += stock;
      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= 5) {
        lowStockCount++;
      }
    });

    // 2. Order & Sales Metrics
    const orderFilter = {
      $or: [{ sellers: sellerObjId }, { 'items.seller': sellerObjId }]
    };

    const orders = await Order.find(orderFilter).sort({ createdAt: -1 });
    const orderCount = orders.length;

    let totalRevenue = 0;
    let totalItemsSold = 0;

    orders.forEach((order) => {
      if (order.status !== 'cancelled') {
        order.items.forEach((item) => {
          if (item.seller && item.seller.toString() === sellerObjId.toString()) {
            totalRevenue += Number(item.price || 0) * Number(item.quantity || 1);
            totalItemsSold += Number(item.quantity || 1);
          }
        });
      }
    });

    // 3. Recent Orders (last 5)
    const recentOrders = orders.slice(0, 5).map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      customerName: order.customer?.name || 'Customer',
      itemCount: order.items.filter((it) => it.seller?.toString() === sellerObjId.toString()).length,
      payableSubtotal: order.items
        .filter((it) => it.seller?.toString() === sellerObjId.toString())
        .reduce((sum, it) => sum + it.price * it.quantity, 0)
    }));

    // 4. Top Selling Products
    const topProducts = [...products]
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0) || (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map((p) => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        image: p.images?.[0] || ''
      }));

    return {
      sellerId: sellerObjId,
      metrics: {
        totalProducts,
        activeProducts,
        totalStock,
        lowStockCount,
        outOfStockCount,
        orderCount,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalItemsSold
      },
      recentOrders,
      topProducts
    };
  },

  /**
   * Update stock inventory count for a seller's product.
   */
  updateStock: async (productId, stock, user, sellerProfile) => {
    let product;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ slug: productId.toLowerCase() });
    }

    if (!product) {
      throw ApiError.notFound(`Product "${productId}" not found`);
    }

    // Ownership Verification
    if (user.role === 'seller') {
      let matchedSellerId = sellerProfile?._id || user.sellerProfile;
      if (!matchedSellerId) {
        const foundSeller = await Seller.findOne({ user: user.userId });
        matchedSellerId = foundSeller?._id;
      }
      if (!matchedSellerId || product.seller.toString() !== matchedSellerId.toString()) {
        throw ApiError.forbidden("Access denied: You are not authorized to update another merchant's product");
      }
    } else if (user.role !== 'admin') {
      throw ApiError.forbidden('Only sellers and administrators can update inventory stock');
    }

    const numericStock = parseInt(stock, 10);
    if (isNaN(numericStock) || numericStock < 0) {
      throw ApiError.badRequest('Stock must be a non-negative integer');
    }

    product.stock = numericStock;
    await product.save();

    logger.info(`Stock updated to ${numericStock} for product "${product.name}" (#${product._id})`);
    return product;
  }
};

export default sellerService;
