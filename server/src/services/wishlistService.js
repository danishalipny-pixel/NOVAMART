import mongoose from 'mongoose';
import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const wishlistService = {
  /**
   * Retrieve the authenticated customer's wishlist.
   * Cleans and filters out deleted or inactive products safely.
   */
  getWishlist: async (userId) => {
    let wishlist = await Wishlist.findOne({ user: userId }).populate(
      'products',
      'name slug price originalPrice images rating reviewCount stock isActive categorySlug brand'
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    // Filter out null (deleted) or inactive products
    const originalLength = wishlist.products.length;
    const validProducts = wishlist.products.filter(
      (p) => p && p._id && p.isActive !== false
    );

    // Self-heal: Clean up references if any products were deleted
    if (validProducts.length !== originalLength) {
      wishlist.products = validProducts.map((p) => p._id);
      await wishlist.save();
    }

    return {
      _id: wishlist._id,
      user: wishlist.user,
      products: validProducts,
      itemCount: validProducts.length
    };
  },

  /**
   * Add a product to the authenticated user's wishlist.
   * Enforces duplicate prevention and validates product existence.
   */
  addToWishlist: async (userId, productId) => {
    if (!productId) {
      throw ApiError.badRequest('Product ID is required');
    }

    // Verify product exists and is active
    let product;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ slug: productId.toLowerCase() });
    }

    if (!product || !product.isActive) {
      throw ApiError.notFound('Product not found or inactive');
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    // Duplicate Prevention Check
    const alreadyExists = wishlist.products.some(
      (p) => (p._id || p).toString() === product._id.toString()
    );

    if (!alreadyExists) {
      wishlist.products.push(product._id);
      await wishlist.save();
      logger.info(`Product "${product.name}" added to user ${userId}'s wishlist`);
    }

    return await wishlistService.getWishlist(userId);
  },

  /**
   * Remove a product from the authenticated user's wishlist.
   */
  removeFromWishlist: async (userId, productId) => {
    if (!productId) {
      throw ApiError.badRequest('Product ID is required');
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return { products: [], itemCount: 0 };
    }

    // Check by ID or resolve slug
    let targetId = productId.toString();
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const product = await Product.findOne({ slug: productId.toLowerCase() });
      if (product) targetId = product._id.toString();
    }

    wishlist.products = wishlist.products.filter(
      (p) => (p._id || p).toString() !== targetId
    );
    await wishlist.save();

    logger.info(`Product ${targetId} removed from user ${userId}'s wishlist`);
    return await wishlistService.getWishlist(userId);
  },

  /**
   * Clear all items from user's wishlist.
   */
  clearWishlist: async (userId) => {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }

    logger.info(`User ${userId}'s wishlist cleared`);
    return {
      message: 'Wishlist cleared successfully',
      products: [],
      itemCount: 0
    };
  },

  /**
   * Check whether a specific product is in the user's wishlist.
   */
  checkWishlist: async (userId, productId) => {
    if (!productId) {
      throw ApiError.badRequest('Product ID is required');
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
      return { isWishlisted: false };
    }

    let targetId = productId.toString();
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const product = await Product.findOne({ slug: productId.toLowerCase() });
      if (product) targetId = product._id.toString();
    }

    const isWishlisted = wishlist.products.some(
      (p) => (p._id || p).toString() === targetId
    );

    return { isWishlisted };
  }
};

export default wishlistService;
