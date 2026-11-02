import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateUpdateProfile, validateChangePassword } from '../validators/userValidator.js';

const router = Router();

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get authenticated user's profile
 * @access  Private
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile attributes (name, phone, avatar, address)
 * @access  Private
 */
router.put('/profile', authenticate, validateUpdateProfile, userController.updateProfile);

/**
 * @route   POST /api/v1/users/change-password
 * @desc    Change user password securely with current password verification
 * @access  Private
 */
router.post('/change-password', authenticate, authLimiter, validateChangePassword, userController.changePassword);

export default router;
