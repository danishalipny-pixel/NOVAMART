import { authService } from '../services/authService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const authController = {
  /**
   * POST /api/v1/auth/register
   */
  register: async (req, res, next) => {
    try {
      const result = await authService.registerUser(req.body);
      return ApiResponse.created(res, 'User registration completed successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/login
   */
  login: async (req, res, next) => {
    try {
      const result = await authService.loginUser(req.body);
      return ApiResponse.success(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/auth/me
   */
  getMe: async (req, res, next) => {
    try {
      const user = await authService.getCurrentUser(req.user.userId);
      return ApiResponse.success(res, 'User profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/become-seller
   */
  becomeSeller: async (req, res, next) => {
    try {
      const result = await authService.applyForSeller(req.user.userId, req.body);
      return ApiResponse.created(res, 'Seller account and store profile activated', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/logout
   */
  logout: async (req, res) => {
    // Stateless JWT tokens are cleared client-side
    return ApiResponse.success(res, 'Logged out successfully');
  }
};

export default authController;
