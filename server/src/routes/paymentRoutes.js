import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * @route   POST /api/v1/payments/create-intent
 * @desc    Create a Stripe PaymentIntent for an authenticated order
 * @access  Private (Authenticated Customer or Admin)
 */
router.post('/create-intent', authenticate, paymentLimiter, paymentController.createPaymentIntent);

/**
 * @route   POST /api/v1/payments/webhook
 * @desc    Handle incoming Stripe webhook events with signature verification
 * @access  Public (Secured via cryptographic Stripe signature)
 */
router.post('/webhook', paymentController.handleWebhook);

/**
 * @route   GET /api/v1/payments/status/:orderId
 * @desc    Get order payment status
 * @access  Private (Owner Customer or Admin)
 */
router.get('/status/:orderId', authenticate, paymentController.getPaymentStatus);

export default router;
