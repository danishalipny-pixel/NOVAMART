import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import {
  validateCreateOrder,
  validateOrderStatusUpdate
} from '../validators/orderValidator.js';
import {
  authenticate,
  requireApprovedSeller,
  requireAdmin
} from '../middleware/authMiddleware.js';

const router = Router();

// Customer Order Operations
router.post('/', authenticate, validateCreateOrder, orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getMyOrders);

// Seller Order Operations
router.get('/seller/my-orders', authenticate, requireApprovedSeller, orderController.getSellerOrders);

// Admin Marketplace Oversight
router.get('/admin/all', authenticate, requireAdmin, orderController.getAllOrders);

// Single Order Inspection (Role-Checked in Service Layer)
router.get('/:id', authenticate, orderController.getOrderById);

// Order Status & Fulfillment Mutation
router.patch(
  '/:id/status',
  authenticate,
  validateOrderStatusUpdate,
  orderController.updateOrderStatus
);

export default router;
