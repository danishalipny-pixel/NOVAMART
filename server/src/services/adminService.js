import { User } from '../models/User.js';
import { Seller } from '../models/Seller.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const adminService = {
  /**
   * Aggregate complete marketplace platform metrics for the administrator dashboard.
   */
  getAdminDashboard: async () => {
    const [
      totalCustomers,
      totalSellers,
      pendingApplications,
      totalProducts,
      totalOrders,
      orders
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Seller.countDocuments({ status: 'approved' }),
      Seller.countDocuments({ status: 'pending' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find({ status: { $ne: 'cancelled' } })
    ]);

    // Calculate verified platform revenue
    let totalRevenue = 0;
    orders.forEach((o) => {
      totalRevenue += Number(o.pricing?.total || 0);
    });

    const averageOrderValue = orders.length > 0
      ? Math.round((totalRevenue / orders.length) * 100) / 100
      : 0;

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email');

    // Recent pending seller applications (last 5)
    const recentApplications = await Seller.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    return {
      metrics: {
        totalCustomers,
        totalSellers,
        pendingApplications,
        totalProducts,
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue
      },
      recentOrders,
      recentApplications
    };
  },

  /**
   * Retrieve paginated marketplace users with role and status filtering.
   */
  getUsers: async (query = {}) => {
    const filter = {};

    if (query.role) {
      filter.role = query.role;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } }
      ];
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sellerProfile', 'storeName status rating')
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  /**
   * Retrieve single user details by ID.
   */
  getUserById: async (userId) => {
    const user = await User.findById(userId)
      .select('-password -__v')
      .populate('sellerProfile');

    if (!user) {
      throw ApiError.notFound(`User "${userId}" not found`);
    }

    return user;
  },

  /**
   * Activate or deactivate a user account.
   */
  updateUserStatus: async (userId, { isActive }, currentAdminId) => {
    if (userId.toString() === currentAdminId.toString()) {
      throw ApiError.badRequest('Administrators cannot modify the active status of their own account');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound(`User "${userId}" not found`);
    }

    user.isActive = Boolean(isActive);
    await user.save();

    logger.info(`User ${user.email} (${user._id}) isActive set to ${user.isActive} by admin ${currentAdminId}`);

    const sanitized = await User.findById(userId).select('-password -__v');
    return sanitized;
  },

  /**
   * Retrieve list of sellers and merchant applications.
   */
  getSellers: async (query = {}) => {
    const filter = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      filter.$or = [
        { storeName: { $regex: term, $options: 'i' } },
        { storeSlug: { $regex: term, $options: 'i' } }
      ];
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const [total, sellers] = await Promise.all([
      Seller.countDocuments(filter),
      Seller.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email phone')
    ]);

    return {
      sellers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  /**
   * Retrieve single seller details by ID.
   */
  getSellerById: async (sellerId) => {
    const seller = await Seller.findById(sellerId).populate('user', 'name email phone');
    if (!seller) {
      throw ApiError.notFound(`Seller "${sellerId}" not found`);
    }
    return seller;
  },

  /**
   * Administrator approves seller application.
   * Updates Seller status to 'approved' and promotes User role to 'seller'.
   */
  approveSeller: async (sellerId) => {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw ApiError.notFound(`Seller application "${sellerId}" not found`);
    }

    seller.status = 'approved';
    seller.rejectionReason = '';
    await seller.save();

    // Promote user account to seller
    const user = await User.findById(seller.user);
    if (user) {
      user.role = 'seller';
      user.sellerProfile = seller._id;
      await user.save();
    }

    logger.info(`Seller "${seller.storeName}" (${seller._id}) APPROVED by administrator`);

    return {
      seller,
      message: `Seller application for "${seller.storeName}" has been approved`
    };
  },

  /**
   * Administrator rejects seller application.
   * Updates Seller status to 'rejected' and records rationale.
   */
  rejectSeller: async (sellerId, { reason = '' }) => {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw ApiError.notFound(`Seller application "${sellerId}" not found`);
    }

    seller.status = 'rejected';
    seller.rejectionReason = reason ? reason.trim() : 'Application did not meet marketplace requirements';
    await seller.save();

    // If user was previously seller, revert role
    const user = await User.findById(seller.user);
    if (user && user.role === 'seller') {
      user.role = 'customer';
      await user.save();
    }

    logger.info(`Seller "${seller.storeName}" (${seller._id}) REJECTED by administrator: ${seller.rejectionReason}`);

    return {
      seller,
      message: `Seller application for "${seller.storeName}" has been rejected`
    };
  },

  /**
   * Retrieve all products with moderation information.
   */
  getProducts: async (query = {}) => {
    const filter = {};

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.seller) {
      filter.seller = query.seller;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { brand: { $regex: term, $options: 'i' } }
      ];
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('seller', 'storeName storeSlug')
        .populate('category', 'name slug')
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  /**
   * Admin moderate product: Toggle active/inactive status.
   */
  updateProductStatus: async (productId, { isActive }) => {
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound(`Product "${productId}" not found`);
    }

    product.isActive = Boolean(isActive);
    await product.save();

    logger.info(`Product "${product.name}" (${product._id}) isActive set to ${product.isActive} by administrator`);
    return product;
  },

  /**
   * Admin delete product.
   */
  deleteProduct: async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound(`Product "${productId}" not found`);
    }

    await Product.findByIdAndDelete(productId);
    logger.info(`Product "${product.name}" (${productId}) permanently removed by administrator`);

    return {
      message: 'Product removed successfully by administrator',
      productId
    };
  }
};

export default adminService;
