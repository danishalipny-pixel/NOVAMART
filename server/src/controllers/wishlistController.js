import { wishlistService } from '../services/wishlistService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const wishlistController = {
  /**
   * Get current authenticated user's wishlist.
   */
  getWishlist: async (req, res, next) => {
    try {
      const wishlist = await wishlistService.getWishlist(req.user.userId);
      return ApiResponse.success(res, 'Wishlist retrieved successfully', wishlist);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add product to wishlist.
   */
  addToWishlist: async (req, res, next) => {
    try {
      const productId = req.params.productId || req.body.productId;
      const wishlist = await wishlistService.addToWishlist(req.user.userId, productId);
      return ApiResponse.success(res, 'Product added to wishlist', wishlist);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove product from wishlist.
   */
  removeFromWishlist: async (req, res, next) => {
    try {
      const productId = req.params.productId || req.body.productId;
      const wishlist = await wishlistService.removeFromWishlist(req.user.userId, productId);
      return ApiResponse.success(res, 'Product removed from wishlist', wishlist);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Clear all items from wishlist.
   */
  clearWishlist: async (req, res, next) => {
    try {
      const result = await wishlistService.clearWishlist(req.user.userId);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check if a product is wishlisted.
   */
  checkWishlist: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const result = await wishlistService.checkWishlist(req.user.userId, productId);
      return ApiResponse.success(res, 'Wishlist status checked', result);
    } catch (error) {
      next(error);
    }
  }
};

export default wishlistController;
