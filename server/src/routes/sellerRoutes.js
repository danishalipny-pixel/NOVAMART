import { Router } from 'express';
import { sellerController } from '../controllers/sellerController.js';
import { authenticate, requireApprovedSeller } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * @route   POST /api/v1/sellers/apply
 * @desc    Submit application to become a verified seller
 * @access  Private (Authenticated Customers)
 */
router.post('/apply', authenticate, authLimiter, sellerController.applyForSeller);

/**
 * @route   GET /api/v1/sellers/application-status
 * @desc    Check seller application status for authenticated user
 * @access  Private (Authenticated Customers / Sellers)
 */
router.get('/application-status', authenticate, sellerController.getApplicationStatus);

/**
 * @route   GET /api/v1/sellers/dashboard
 * @desc    Get real-time verified seller dashboard metrics
 * @access  Private (Approved Sellers Only)
 */
router.get('/dashboard', authenticate, requireApprovedSeller, sellerController.getSellerDashboard);

/**
 * @route   PATCH /api/v1/sellers/products/:id/stock
 * @desc    Quick stock update for a merchant product
 * @access  Private (Seller Owner Only)
 */
router.patch('/products/:id/stock', authenticate, requireApprovedSeller, sellerController.updateStock);

export default router;
