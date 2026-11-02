import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Seller } from '../models/Seller.js';
import { ApiError } from '../utils/ApiError.js';

export const orderService = {
  /**
   * Create a new order with server-side price calculation and safe inventory deduction.
   */
  createOrder: async (customerId, { items, shippingAddress, paymentMethod = 'card' }) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw ApiError.badRequest('Order must contain at least one product item');
    }

    const processedItems = [];
    const sellersSet = new Set();
    let calculatedSubtotal = 0;

    // Phase 1: Validate all items & stock before mutating inventory
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product || !product.isActive) {
        throw ApiError.badRequest(
          `Product "${item.product}" is currently unavailable or no longer listed`
        );
      }

      const requestedQty = parseInt(item.quantity, 10);
      if (requestedQty <= 0) {
        throw ApiError.badRequest(`Invalid quantity for product "${product.name}"`);
      }

      if (product.stock < requestedQty) {
        throw ApiError.badRequest(
          `Insufficient inventory for "${product.name}". Requested: ${requestedQty}, Available: ${product.stock}`
        );
      }

      // Record verified server-side price (never trust client)
      const verifiedPrice = Number(product.price);
      const itemSubtotal = verifiedPrice * requestedQty;
      calculatedSubtotal += itemSubtotal;

      const sellerIdStr = product.seller.toString();
      sellersSet.add(sellerIdStr);

      processedItems.push({
        productDoc: product,
        orderItemData: {
          product: product._id,
          seller: product.seller,
          name: product.name,
          price: verifiedPrice,
          quantity: requestedQty,
          image: (product.images && product.images[0]) || '',
          selectedSpecs: item.selectedSpecs || new Map()
        }
      });
    }

    // Phase 2: Safely deduct inventory stock
    for (const { productDoc, orderItemData } of processedItems) {
      productDoc.stock -= orderItemData.quantity;
      await productDoc.save();
    }

    // Server-Side Calculations: Free shipping threshold ($100), 8% tax
    const subtotal = Math.round(calculatedSubtotal * 100) / 100;
    const shippingFee = subtotal >= 100 ? 0 : 15.0;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shippingFee + tax) * 100) / 100;

    // Generate unique order number
    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `NM-${timestampPart}-${randomPart}`;

    const order = new Order({
      orderNumber,
      customer: customerId,
      sellers: Array.from(sellersSet).map((id) => new mongoose.Types.ObjectId(id)),
      items: processedItems.map((p) => p.orderItemData),
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country ? shippingAddress.country.trim() : 'US',
        phone: shippingAddress.phone.trim()
      },
      payment: {
        method: paymentMethod,
        status: 'authorized',
        transactionId: `TX-${Date.now()}-${randomPart}`,
        paidAt: new Date()
      },
      pricing: {
        subtotal,
        shippingFee,
        tax,
        total
      },
      status: 'processing'
    });

    await order.save();
    await order.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'items.product', select: 'name slug images brand' }
    ]);

    return order;
  },

  /**
   * Get orders placed by a specific customer.
   */
  getCustomerOrders: async (customerId, query = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { customer: customerId };

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.product', 'name slug images brand')
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  /**
   * Get single order by ID or orderNumber with strict ownership/role verification.
   */
  getOrderById: async (orderIdOrNumber, user, sellerProfile) => {
    let order;
    if (mongoose.Types.ObjectId.isValid(orderIdOrNumber)) {
      order = await Order.findById(orderIdOrNumber)
        .populate('customer', 'name email phone')
        .populate('items.product', 'name slug images brand');
    } else {
      order = await Order.findOne({ orderNumber: orderIdOrNumber.toUpperCase() })
        .populate('customer', 'name email phone')
        .populate('items.product', 'name slug images brand');
    }

    if (!order) {
      throw ApiError.notFound(`Order "${orderIdOrNumber}" not found`);
    }

    // Role-Based Access Enforcement
    if (user.role === 'customer') {
      if (order.customer._id.toString() !== user.userId) {
        throw ApiError.forbidden('Access denied: You can only view your own orders');
      }
    } else if (user.role === 'seller') {
      let matchedSellerId = sellerProfile?._id || user.sellerProfile;
      if (!matchedSellerId) {
        const foundSeller = await Seller.findOne({ user: user.userId });
        matchedSellerId = foundSeller?._id;
      }
      if (!matchedSellerId) {
        throw ApiError.forbidden('Seller profile required to access order');
      }
      const sellerIdStr = matchedSellerId.toString();
      const hasSellerItem =
        (order.sellers && order.sellers.some((s) => s.toString() === sellerIdStr)) ||
        order.items.some((item) => item.seller && item.seller.toString() === sellerIdStr);

      if (!hasSellerItem) {
        throw ApiError.forbidden(
          'Access denied: You can only access orders that contain products from your store'
        );
      }
    } else if (user.role !== 'admin') {
      throw ApiError.forbidden('Access denied: Insufficient privileges to view this order');
    }

    return order;
  },

  /**
   * Get all orders containing products belonging to an authenticated seller.
   */
  getSellerOrders: async (sellerProfileId, query = {}) => {
    if (!sellerProfileId) {
      throw ApiError.forbidden('Seller profile required to fetch seller orders');
    }

    const filter = {
      $or: [{ sellers: sellerProfileId }, { 'items.seller': sellerProfileId }]
    };

    if (query.status) {
      filter.status = query.status;
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name email')
        .populate('items.product', 'name slug images brand')
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  /**
   * Administrative order access: Get all orders across the entire marketplace.
   */
  getAllOrders: async (query = {}) => {
    const filter = {};
    if (query.status) {
      filter.status = query.status;
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name email')
        .populate('items.product', 'name slug brand')
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  /**
   * Update order status (Seller for their items / overall status if single seller, or Admin).
   * Restores inventory if cancelled.
   */
  updateOrderStatus: async (orderId, { status, trackingNumber, cancelReason }, user, sellerProfile) => {
    let order;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    } else {
      order = await Order.findOne({ orderNumber: orderId.toUpperCase() });
    }

    if (!order) {
      throw ApiError.notFound(`Order "${orderId}" not found`);
    }

    // Role-based authorization
    if (user.role === 'seller') {
      let matchedSellerId = sellerProfile?._id || user.sellerProfile;
      if (!matchedSellerId) {
        const foundSeller = await Seller.findOne({ user: user.userId });
        matchedSellerId = foundSeller?._id;
      }
      if (!matchedSellerId) {
        throw ApiError.forbidden('Seller profile required');
      }
      const sellerIdStr = matchedSellerId.toString();
      const hasSellerItem =
        (order.sellers && order.sellers.some((s) => s.toString() === sellerIdStr)) ||
        order.items.some((item) => item.seller && item.seller.toString() === sellerIdStr);

      if (!hasSellerItem) {
        throw ApiError.forbidden(
          "Access denied: You can only update orders that contain your store's items"
        );
      }
    } else if (user.role !== 'admin') {
      throw ApiError.forbidden('Access denied: Insufficient privileges to update order status');
    }

    const previousStatus = order.status;

    // Handle cancellation: Restore inventory
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
      order.cancelledAt = new Date();
      order.cancelReason = cancelReason ? cancelReason.trim() : 'Cancelled by merchant or administrator';
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    order.status = status;
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber.trim();
    }

    await order.save();
    return order;
  }
};

export default orderService;
