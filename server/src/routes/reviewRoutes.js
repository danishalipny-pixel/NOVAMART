import { Router } from 'express';
import { reviewController } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateCreateReview, validateUpdateReview } from '../validators/reviewValidator.js';

const router = Router();

/**
 * @route   POST /api/v1/reviews
 * @desc    Submit a verified product review
 * @access  Private (Verified Buyers)
 */
router.post('/', authenticate, validateCreateReview, reviewController.createReview);

/**
 * @route   GET /api/v1/reviews/product/:productId
 * @desc    Get all reviews and rating stats for a product
 * @access  Public
 */
router.get('/product/:productId', reviewController.getProductReviews);

/**
 * @route   GET /api/v1/reviews/product/:productId/stats
 * @desc    Get rating distribution and average rating for a product
 * @access  Public
 */
router.get('/product/:productId/stats', reviewController.getRatingStats);

/**
 * @route   PUT /api/v1/reviews/:id
 * @desc    Update own product review
 * @access  Private (Review Author)
 */
router.put('/:id', authenticate, validateUpdateReview, reviewController.updateReview);

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete review (Author or Admin Moderation)
 * @access  Private (Review Author or Admin)
 */
router.delete('/:id', authenticate, reviewController.deleteReview);

export default router;
