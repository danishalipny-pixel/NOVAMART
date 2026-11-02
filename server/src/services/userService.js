import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const userService = {
  /**
   * Retrieve the authenticated user's profile.
   * Strips all sensitive fields.
   */
  getProfile: async (userId) => {
    const user = await User.findById(userId)
      .select('-password -__v')
      .populate('sellerProfile', 'storeName storeSlug status rating logo');

    if (!user) {
      throw ApiError.notFound('User profile not found');
    }

    return user;
  },

  /**
   * Update authenticated user's profile information.
   * Strictly restricts modifications to safe customer profile attributes.
   * Never permits modification of role, admin status, seller approval, or password.
   */
  updateProfile: async (userId, updateData) => {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User profile not found');
    }

    // Whitelist allowable attributes
    if (updateData.name && updateData.name.trim()) {
      user.name = updateData.name.trim();
    }

    if (updateData.phone !== undefined) {
      user.phone = updateData.phone.trim();
    }

    if (updateData.avatar !== undefined) {
      user.avatar = updateData.avatar.trim();
    }

    if (updateData.address && typeof updateData.address === 'object') {
      user.address = {
        street: updateData.address.street !== undefined ? updateData.address.street.trim() : (user.address?.street || ''),
        city: updateData.address.city !== undefined ? updateData.address.city.trim() : (user.address?.city || ''),
        state: updateData.address.state !== undefined ? updateData.address.state.trim() : (user.address?.state || ''),
        postalCode: updateData.address.postalCode !== undefined ? updateData.address.postalCode.trim() : (user.address?.postalCode || ''),
        country: updateData.address.country !== undefined ? updateData.address.country.trim() : (user.address?.country || 'US')
      };
    }

    // Save triggers schema validations and returns clean JSON
    await user.save();
    logger.info(`Profile updated successfully for user ID: ${userId}`);

    const sanitizedUser = await User.findById(userId)
      .select('-password -__v')
      .populate('sellerProfile', 'storeName storeSlug status rating logo');

    return sanitizedUser;
  },

  /**
   * Securely update password.
   * Verifies current password using bcrypt, validates and hashes new password,
   * and never exposes hashes or plaintext passwords.
   */
  changePassword: async (userId, { currentPassword, newPassword }) => {
    if (!currentPassword) {
      throw ApiError.badRequest('Current password is required');
    }

    if (!newPassword) {
      throw ApiError.badRequest('New password is required');
    }

    if (newPassword.length < 8) {
      throw ApiError.badRequest('New password must be at least 8 characters long');
    }

    // Fetch user with password field explicitly selected
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw ApiError.badRequest('Incorrect current password');
    }

    // Check if new password matches current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw ApiError.badRequest('New password must be different from your current password');
    }

    // Set new password (pre-save middleware hashes with bcrypt)
    user.password = newPassword;
    await user.save();

    logger.info(`Password securely changed for user ID: ${userId}`);

    return {
      message: 'Password changed successfully'
    };
  }
};

export default userService;
