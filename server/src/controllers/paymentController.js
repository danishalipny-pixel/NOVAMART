import { paymentService } from '../services/paymentService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const paymentController = {
  /**
   * Create or retrieve Stripe PaymentIntent for an order.
   */
  createPaymentIntent: async (req, res, next) => {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        throw ApiError.badRequest('orderId is required in request body');
      }

      const intentData = await paymentService.createPaymentIntent(orderId, req.user);
      return ApiResponse.created(res, 'Payment intent created successfully', intentData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Process raw Stripe webhook events with cryptographic signature verification.
   */
  handleWebhook: async (req, res, next) => {
    try {
      const signature = req.headers['stripe-signature'];
      // req.body is a raw Buffer if processed with express.raw()
      const result = await paymentService.handleWebhookEvent(req.body, signature);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get payment status of an order.
   */
  getPaymentStatus: async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const statusData = await paymentService.getOrderPaymentStatus(orderId, req.user);
      return ApiResponse.success(res, 'Payment status retrieved successfully', statusData);
    } catch (error) {
      next(error);
    }
  }
};

export default paymentController;
