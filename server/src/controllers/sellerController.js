import { sellerService } from '../services/sellerService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const sellerController = {
  /**
   * Submit seller application.
   */
  applyForSeller: async (req, res, next) => {
    try {
      const result = await sellerService.applyForSeller(req.user.userId, req.body);
      return ApiResponse.created(res, result.message, result.seller);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get seller application status for authenticated user.
   */
  getApplicationStatus: async (req, res, next) => {
    try {
      const result = await sellerService.getApplicationStatus(req.user.userId);
      return ApiResponse.success(res, 'Seller application status retrieved', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get seller dashboard metrics.
   */
  getSellerDashboard: async (req, res, next) => {
    try {
      const sellerProfileId = req.seller?._id || req.user.sellerProfile;
      const dashboardData = await sellerService.getSellerDashboard(sellerProfileId);
      return ApiResponse.success(res, 'Seller dashboard data retrieved successfully', dashboardData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update product inventory stock.
   */
  updateStock: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const product = await sellerService.updateStock(id, stock, req.user, req.seller);
      return ApiResponse.success(res, 'Inventory stock updated successfully', product);
    } catch (error) {
      next(error);
    }
  }
};

export default sellerController;
