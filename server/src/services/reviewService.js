import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Recalculate and update the average rating and review count of a product.
 */
const updateProductRatingMetrics = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const reviewCount = reviews.length;

  let averageRating = 0;
  if (reviewCount > 0) {
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    averageRating = Math.round((sum / reviewCount) * 10) / 10;
  }

  const product = await Product.findById(productId);
  if (product) {
    product.rating = averageRating;
    product.reviewCount = reviewCount;
    await product.save();
    logger.info(`Updated Product "${product.name}" rating to ${averageRating} (${reviewCount} reviews)`);
  }

  return { averageRating, reviewCount };
};

export const reviewService = {
  /**
   * Helper to recalculate ratings (exported for test/maintenance use).
   */
  updateProductRatingMetrics,

  /**
   * Create a new verified product review.
   * Enforces verified purchase check and duplicate review prevention.
   */
  createReview: async (userId, productId, { rating, comment, title, images = [] }) => {
    // Resolve product by ID or slug
    let product;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ slug: productId.toLowerCase() });
    }

    if (!product || !product.isActive) {
      throw ApiError.notFound(`Product "${productId}" not found or inactive`);
    }

    // 1. Duplicate Review Prevention: Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: product._id,
      user: userId
    });

    if (existingReview) {
      throw ApiError.badRequest(
        'You have already reviewed this product. You can update your existing review instead.'
      );
    }

    // 2. Verified Purchase Eligibility Verification:
    // Check if the user has an order containing this product that is not cancelled
    const matchingOrder = await Order.findOne({
      customer: userId,
      'items.product': product._id,
      status: { $ne: 'cancelled' }
    });

    if (!matchingOrder) {
      throw ApiError.forbidden(
        'Only customers who have purchased this product can submit a verified review.'
      );
    }

    // 3. Validation
    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      throw ApiError.badRequest('Rating must be an integer between 1 and 5');
    }

    if (!comment || comment.trim().length < 5) {
      throw ApiError.badRequest('Review comment must be at least 5 characters long');
    }

    // 4. Create and Save Review
    const review = await Review.create({
      product: product._id,
      user: userId,
      order: matchingOrder._id,
      rating: numericRating,
      title: title ? title.trim() : '',
      comment: comment.trim(),
      images: Array.isArray(images) ? images : [],
      isVerifiedPurchase: true
    });
    logger.info(`Review created for product "${product.name}" by user ${userId}`);

    // 5. Recalculate Product Rating Aggregation
    await updateProductRatingMetrics(product._id);

    // Return populated review
    const populatedReview = await Review.findById(review._id).populate(
      'user',
      'name avatar'
    );

    return populatedReview;
  },

  /**
   * Retrieve all reviews for a product with pagination, sorting, and rating breakdown.
   */
  getProductReviews: async (productId, query = {}) => {
    let product;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ slug: productId.toLowerCase() });
    }

    if (!product) {
      throw ApiError.notFound(`Product "${productId}" not found`);
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Sorting
    let sort = { createdAt: -1 }; // default newest
    if (query.sortBy === 'highest') {
      sort = { rating: -1, createdAt: -1 };
    } else if (query.sortBy === 'lowest') {
      sort = { rating: 1, createdAt: -1 };
    } else if (query.sortBy === 'helpful') {
      sort = { helpfulVotes: -1, createdAt: -1 };
    }

    const filter = { product: product._id };

    // Star filter
    if (query.rating && [1, 2, 3, 4, 5].includes(Number(query.rating))) {
      filter.rating = Number(query.rating);
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar role'),
      Review.countDocuments(filter)
    ]);

    // Calculate rating distribution across all reviews of this product
    const allReviews = await Review.find({ product: product._id });
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    allReviews.forEach((r) => {
      const star = r.rating;
      if (distribution[star] !== undefined) {
        distribution[star]++;
      }
      sum += star;
    });

    const averageRating = allReviews.length > 0
      ? Math.round((sum / allReviews.length) * 10) / 10
      : 0;

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      },
      stats: {
        averageRating,
        totalReviews: allReviews.length,
        distribution
      }
    };
  },

  /**
   * Update an existing review (Only review author can update).
   */
  updateReview: async (reviewId, updateData, user) => {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw ApiError.notFound(`Review "${reviewId}" not found`);
    }

    // Ownership Verification
    if (review.user.toString() !== user.userId) {
      throw ApiError.forbidden('Access denied: You can only edit your own reviews');
    }

    if (updateData.rating !== undefined) {
      const numericRating = Number(updateData.rating);
      if (!numericRating || numericRating < 1 || numericRating > 5) {
        throw ApiError.badRequest('Rating must be an integer between 1 and 5');
      }
      review.rating = numericRating;
    }

    if (updateData.comment !== undefined) {
      if (updateData.comment.trim().length < 5) {
        throw ApiError.badRequest('Review comment must be at least 5 characters long');
      }
      review.comment = updateData.comment.trim();
    }

    if (updateData.title !== undefined) {
      review.title = updateData.title.trim();
    }

    if (updateData.images && Array.isArray(updateData.images)) {
      review.images = updateData.images;
    }

    await review.save();
    logger.info(`Review ${reviewId} updated by user ${user.userId}`);

    // Recalculate Product Rating Aggregation
    await updateProductRatingMetrics(review.product);

    const updated = await Review.findById(review._id).populate('user', 'name avatar');
    return updated;
  },

  /**
   * Delete a review (Review author or Admin moderation).
   */
  deleteReview: async (reviewId, user) => {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw ApiError.notFound(`Review "${reviewId}" not found`);
    }

    // Authorization: Author OR Admin
    const isAuthor = review.user.toString() === user.userId;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      throw ApiError.forbidden(
        'Access denied: You are not authorized to delete this review'
      );
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);
    logger.info(`Review ${reviewId} deleted by user ${user.userId} (Role: ${user.role})`);

    // Recalculate Product Rating Aggregation
    await updateProductRatingMetrics(productId);

    return {
      message: 'Review deleted successfully',
      reviewId
    };
  },

  /**
   * Get rating statistics and breakdown for a product.
   */
  getRatingStats: async (productId) => {
    let product;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ slug: productId.toLowerCase() });
    }

    if (!product) {
      throw ApiError.notFound(`Product "${productId}" not found`);
    }

    const reviews = await Review.find({ product: product._id });
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      const star = r.rating;
      if (distribution[star] !== undefined) {
        distribution[star]++;
      }
      sum += star;
    });

    const averageRating = reviews.length > 0
      ? Math.round((sum / reviews.length) * 10) / 10
      : 0;

    return {
      productId: product._id,
      averageRating,
      totalReviews: reviews.length,
      distribution
    };
  }
};

export default reviewService;
