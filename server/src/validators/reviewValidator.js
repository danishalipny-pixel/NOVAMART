import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';

export const validateCreateReview = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Review comment must be between 5 and 2000 characters'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Review title cannot exceed 120 characters'),

  validateRequest
];

export const validateUpdateReview = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage('Review comment must be between 5 and 2000 characters'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Review title cannot exceed 120 characters'),

  validateRequest
];

export default {
  validateCreateReview,
  validateUpdateReview
};
