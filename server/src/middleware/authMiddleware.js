import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import { Seller } from '../models/Seller.js';

/**
 * Authentication verification middleware.
 * Inspects Authorization: Bearer <token> header and verifies JWT.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Authentication token is required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { userId, role, email, name }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Authentication token has expired'));
    }
    return next(ApiError.unauthorized('Invalid or malformed authentication token'));
  }
};

/**
 * Role-Based Access Control (RBAC) guard middleware.
 * Verifies that the authenticated user possesses one of the required roles.
 * @param  {...string} allowedRoles - e.g. 'customer', 'seller', 'admin'
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};

/**
 * Seller-specific guard middleware.
 * Enforces that user is a seller AND their seller profile status is 'approved'.
 */
export const requireApprovedSeller = async (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.role !== 'seller') {
    return next(ApiError.forbidden('Access forbidden: Seller privileges required'));
  }

  try {
    const seller = await Seller.findOne({ user: req.user.userId });
    if (!seller) {
      return next(ApiError.forbidden('Seller store profile not found for this account'));
    }

    if (seller.status !== 'approved') {
      return next(
        ApiError.forbidden(`Seller access denied: Store account status is '${seller.status}'`)
      );
    }

    req.seller = seller;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-only guard middleware.
 */
export const requireAdmin = authorize('admin');

export default {
  authenticate,
  authorize,
  requireApprovedSeller,
  requireAdmin
};
