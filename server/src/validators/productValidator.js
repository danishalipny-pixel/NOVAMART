import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';

export const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10 })
    .withMessage('Product description must be at least 10 characters long'),

  body('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),

  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price cannot be negative'),

  body('discountPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percentage must be between 0 and 100'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category reference is required'),

  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand name is required'),

  body('stock')
    .notEmpty()
    .withMessage('Stock quantity is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer greater than or equal to 0'),

  body('sku')
    .optional()
    .trim()
    .toUpperCase(),

  body('images')
    .isArray({ min: 1 })
    .withMessage('Product must include at least one image URL or asset path'),

  body('images.*')
    .isString()
    .notEmpty()
    .withMessage('Each image in images array must be a non-empty string'),

  body('badge')
    .optional()
    .trim(),

  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array of strings'),

  body('specs')
    .optional(),

  validateRequest
];

export const validateUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Product description must be at least 10 characters long'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),

  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price cannot be negative'),

  body('discountPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percentage must be between 0 and 100'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Images must be an array with at least one image'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  validateRequest
];

export const validateProductQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer >= 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a non-negative number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a non-negative number'),

  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock must be true or false'),

  query('sort')
    .optional()
    .isIn(['featured', 'price-asc', 'price-desc', 'rating', 'newest'])
    .withMessage('Invalid sort parameter'),

  validateRequest
];

export default {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQuery
};
