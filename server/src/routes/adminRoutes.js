import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Protect ALL administrative routes with authentication and strict admin role check
router.use(authenticate, authorize('admin'));

/**
 * Platform Metrics & Dashboard
 * @route GET /api/v1/admin/dashboard
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * User Accounts Management
 * @route GET /api/v1/admin/users
 * @route GET /api/v1/admin/users/:id
 * @route PATCH /api/v1/admin/users/:id/status
 */
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/status', adminController.updateUserStatus);

/**
 * Seller Onboarding & Management
 * @route GET /api/v1/admin/sellers
 * @route GET /api/v1/admin/sellers/pending
 * @route GET /api/v1/admin/sellers/:id
 * @route PATCH /api/v1/admin/sellers/:id/approve
 * @route PATCH /api/v1/admin/sellers/:id/reject
 */
router.get('/sellers', adminController.getSellers);
router.get('/sellers/pending', adminController.getPendingSellers);
router.get('/sellers/:id', adminController.getSellerById);
router.patch('/sellers/:id/approve', adminController.approveSeller);
router.patch('/sellers/:id/reject', adminController.rejectSeller);

/**
 * Product Moderation
 * @route GET /api/v1/admin/products
 * @route PATCH /api/v1/admin/products/:id/status
 * @route DELETE /api/v1/admin/products/:id
 */
router.get('/products', adminController.getProducts);
router.patch('/products/:id/status', adminController.updateProductStatus);
router.delete('/products/:id', adminController.deleteProduct);

/**
 * Marketplace Order Management
 * @route GET /api/v1/admin/orders
 * @route GET /api/v1/admin/orders/:id
 * @route PATCH /api/v1/admin/orders/:id/status
 */
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderById);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

export default router;
