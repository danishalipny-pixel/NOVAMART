import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';

/**
 * Registration request validation rules.
 */
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  body('role')
    .optional()
    .custom((val) => {
      if (val === 'admin') {
        throw new Error('Administrative accounts cannot be registered publicly');
      }
      if (!['customer', 'seller'].includes(val)) {
        throw new Error('Role must be either "customer" or "seller"');
      }
      return true;
    }),

  body('storeName')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('Store name is required when registering as a seller')
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters'),

  body('storeSlug')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('Store slug is required when registering as a seller')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Store slug must contain only lowercase letters, numbers, and hyphens'),

  validateRequest
];

/**
 * Login request validation rules.
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validateRequest
];

/**
 * Seller application validation rules.
 */
export const validateSellerApplication = [
  body('storeName')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters'),

  body('storeSlug')
    .trim()
    .notEmpty()
    .withMessage('Store slug is required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Store slug must contain only lowercase letters, numbers, and hyphens'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  validateRequest
];

export default {
  validateRegister,
  validateLogin,
  validateSellerApplication
};
