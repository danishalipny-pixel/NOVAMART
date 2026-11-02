import { adminService } from '../services/adminService.js';
import { orderService } from '../services/orderService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const adminController = {
  /**
   * Get administrative dashboard overview metrics.
   */
  getDashboard: async (req, res, next) => {
    try {
      const data = await adminService.getAdminDashboard();
      return ApiResponse.success(res, 'Administrator dashboard overview retrieved', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get users list with filters and search.
   */
  getUsers: async (req, res, next) => {
    try {
      const data = await adminService.getUsers(req.query);
      return ApiResponse.success(res, 'User accounts retrieved', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user details by ID.
   */
  getUserById: async (req, res, next) => {
    try {
      const data = await adminService.getUserById(req.params.id);
      return ApiResponse.success(res, 'User details retrieved', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Activate / deactivate user account.
   */
  updateUserStatus: async (req, res, next) => {
    try {
      const user = await adminService.updateUserStatus(req.params.id, req.body, req.user.userId);
      return ApiResponse.success(res, 'User status updated successfully', user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all sellers.
   */
  getSellers: async (req, res, next) => {
    try {
      const data = await adminService.getSellers(req.query);
      return ApiResponse.success(res, 'Sellers list retrieved', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get pending seller applications.
   */
  getPendingSellers: async (req, res, next) => {
    try {
      const data = await adminService.getSellers({ ...req.query, status: 'pending' });
      return ApiResponse.success(res, 'Pending seller applications retrieved', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get seller by ID.
   */
  getSellerById: async (req, res, next) => {
    try {
      const data = await adminService.getSellerById(req.params.id);
      return ApiResponse.success(res, 'Seller details retrieved', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Approve seller application.
   */
  approveSeller: async (req, res, next) => {
    try {
      const result = await adminService.approveSeller(req.params.id);
      return ApiResponse.success(res, result.message, result.seller);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reject seller application.
   */
  rejectSeller: async (req, res, next) => {
    try {
      const result = await adminService.rejectSeller(req.params.id, req.body);
      return ApiResponse.success(res, result.message, result.seller);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get products for moderation.
   */
  getProducts: async (req, res, next) => {
    try {
      const data = await adminService.getProducts(req.query);
      return ApiResponse.success(res, 'Marketplace products retrieved for moderation', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle product active status.
   */
  updateProductStatus: async (req, res, next) => {
    try {
      const product = await adminService.updateProductStatus(req.params.id, req.body);
      return ApiResponse.success(res, 'Product moderation status updated', product);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete product as admin.
   */
  deleteProduct: async (req, res, next) => {
    try {
      const result = await adminService.deleteProduct(req.params.id);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all orders as admin.
   */
  getAllOrders: async (req, res, next) => {
    try {
      const result = await orderService.getAllOrders(req.query);
      return ApiResponse.success(res, 'All marketplace orders retrieved', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single order details as admin.
   */
  getOrderById: async (req, res, next) => {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user);
      return ApiResponse.success(res, 'Order details retrieved', order);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update order status as admin.
   */
  updateOrderStatus: async (req, res, next) => {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body, req.user);
      return ApiResponse.success(res, 'Order status updated successfully', order);
    } catch (error) {
      next(error);
    }
  }
};

export default adminController;
