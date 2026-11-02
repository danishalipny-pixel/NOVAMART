import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';

export const validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Category name must be between 2 and 60 characters'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Category slug must contain only lowercase letters, numbers, and hyphens'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('icon')
    .optional()
    .trim(),

  body('image')
    .optional()
    .trim(),

  body('parentCategory')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('parentCategory must be a valid MongoDB ObjectId'),

  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('displayOrder must be a non-negative integer'),

  validateRequest
];

export const validateUpdateCategory = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Category ID or slug is required'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Category name must be between 2 and 60 characters'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Category slug must contain only lowercase letters, numbers, and hyphens'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  validateRequest
];

export default {
  validateCreateCategory,
  validateUpdateCategory
};
