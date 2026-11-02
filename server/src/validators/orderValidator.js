import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';

export const validateCreateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),

  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer of at least 1'),

  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),

  body('shippingAddress.fullName')
    .trim()
    .notEmpty()
    .withMessage('Recipient full name is required'),

  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),

  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State / Province is required'),

  body('shippingAddress.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),

  body('shippingAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),

  body('paymentMethod')
    .optional()
    .isIn(['card', 'stripe', 'paypal', 'cash_on_delivery'])
    .withMessage('Invalid payment method'),

  validateRequest
];

export const validateOrderStatusUpdate = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required'),

  body('status')
    .notEmpty()
    .withMessage('Order status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid order status'),

  body('trackingNumber')
    .optional()
    .trim(),

  body('cancelReason')
    .optional()
    .trim(),

  validateRequest
];

export default {
  validateCreateOrder,
  validateOrderStatusUpdate
};
