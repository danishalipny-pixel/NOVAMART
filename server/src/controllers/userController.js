import { userService } from '../services/userService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const userController = {
  /**
   * Get current authenticated user profile.
   */
  getProfile: async (req, res, next) => {
    try {
      const user = await userService.getProfile(req.user.userId);
      return ApiResponse.success(res, 'User profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update profile information.
   */
  updateProfile: async (req, res, next) => {
    try {
      const updatedUser = await userService.updateProfile(req.user.userId, req.body);
      return ApiResponse.success(res, 'Profile updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change user password.
   */
  changePassword: async (req, res, next) => {
    try {
      const result = await userService.changePassword(req.user.userId, req.body);
      return ApiResponse.success(res, result.message, null);
    } catch (error) {
      next(error);
    }
  }
};

export default userController;
