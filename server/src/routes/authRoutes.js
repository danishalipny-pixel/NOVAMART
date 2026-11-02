import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateSellerApplication
} from '../validators/authValidator.js';
import {
  authenticate,
  authorize,
  requireApprovedSeller,
  requireAdmin
} from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

// Public Authentication Endpoints
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/logout', authController.logout);

// Authenticated User Endpoints
router.get('/me', authenticate, authController.getMe);
router.post('/become-seller', authenticate, validateSellerApplication, authController.becomeSeller);

// Role-Guarded Verification Test Endpoints
router.get('/test/customer-only', authenticate, authorize('customer', 'seller', 'admin'), (req, res) => {
  return ApiResponse.success(res, 'Access granted: Authenticated customer area', {
    user: req.user
  });
});

router.get('/test/seller-only', authenticate, requireApprovedSeller, (req, res) => {
  return ApiResponse.success(res, 'Access granted: Verified seller store management', {
    user: req.user,
    seller: req.seller
  });
});

router.get('/test/admin-only', authenticate, requireAdmin, (req, res) => {
  return ApiResponse.success(res, 'Access granted: Administrator portal', {
    user: req.user
  });
});

export default router;
