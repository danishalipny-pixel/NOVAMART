import { reviewService } from '../services/reviewService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const reviewController = {
  /**
   * Submit a verified product review.
   */
  createReview: async (req, res, next) => {
    try {
      const productId = req.params.productId || req.body.productId;
      const review = await reviewService.createReview(
        req.user.userId,
        productId,
        req.body
      );
      return ApiResponse.created(res, 'Review submitted successfully', review);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all reviews and rating breakdown for a product.
   */
  getProductReviews: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const result = await reviewService.getProductReviews(productId, req.query);
      return ApiResponse.success(res, 'Product reviews retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update an existing review.
   */
  updateReview: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedReview = await reviewService.updateReview(id, req.body, req.user);
      return ApiResponse.success(res, 'Review updated successfully', updatedReview);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a review (Author or Admin).
   */
  deleteReview: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await reviewService.deleteReview(id, req.user);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get product rating statistics.
   */
  getRatingStats: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const stats = await reviewService.getRatingStats(productId);
      return ApiResponse.success(res, 'Rating statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }
};

export default reviewController;
