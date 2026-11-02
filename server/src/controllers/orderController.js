import { orderService } from '../services/orderService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const orderController = {
  createOrder: async (req, res, next) => {
    try {
      const order = await orderService.createOrder(req.user.userId, req.body);
      return ApiResponse.created(res, 'Order placed successfully and inventory updated', order);
    } catch (error) {
      next(error);
    }
  },

  getMyOrders: async (req, res, next) => {
    try {
      const result = await orderService.getCustomerOrders(req.user.userId, req.query);
      return ApiResponse.success(res, 'Customer orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  },

  getOrderById: async (req, res, next) => {
    try {
      const order = await orderService.getOrderById(
        req.params.id,
        req.user,
        req.seller
      );
      return ApiResponse.success(res, 'Order details retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  },

  getSellerOrders: async (req, res, next) => {
    try {
      const sellerProfileId = req.seller?._id || req.user?.sellerProfile;
      const result = await orderService.getSellerOrders(sellerProfileId, req.query);
      return ApiResponse.success(res, 'Seller orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  },

  getAllOrders: async (req, res, next) => {
    try {
      const result = await orderService.getAllOrders(req.query);
      return ApiResponse.success(res, 'All marketplace orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  },

  updateOrderStatus: async (req, res, next) => {
    try {
      const order = await orderService.updateOrderStatus(
        req.params.id,
        req.body,
        req.user,
        req.seller
      );
      return ApiResponse.success(res, 'Order status updated successfully', order);
    } catch (error) {
      next(error);
    }
  }
};

export default orderController;
