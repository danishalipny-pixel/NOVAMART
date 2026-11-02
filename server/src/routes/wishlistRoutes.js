import { Router } from 'express';
import { wishlistController } from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/v1/wishlist
 * @desc    Get current authenticated user's wishlist
 * @access  Private
 */
router.get('/', authenticate, wishlistController.getWishlist);

/**
 * @route   POST /api/v1/wishlist
 * @desc    Add product to wishlist via body
 * @access  Private
 */
router.post('/', authenticate, wishlistController.addToWishlist);

/**
 * @route   POST /api/v1/wishlist/:productId
 * @desc    Add product to wishlist via param
 * @access  Private
 */
router.post('/:productId', authenticate, wishlistController.addToWishlist);

/**
 * @route   DELETE /api/v1/wishlist
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.delete('/', authenticate, wishlistController.clearWishlist);

/**
 * @route   DELETE /api/v1/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete('/:productId', authenticate, wishlistController.removeFromWishlist);

/**
 * @route   GET /api/v1/wishlist/check/:productId
 * @desc    Check whether a product is in user's wishlist
 * @access  Private
 */
router.get('/check/:productId', authenticate, wishlistController.checkWishlist);

export default router;
