import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';

export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone number cannot exceed 30 characters'),

  body('avatar')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Avatar URL cannot exceed 500 characters'),

  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),

  validateRequest
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),

  validateRequest
];

export default {
  validateUpdateProfile,
  validateChangePassword
};
