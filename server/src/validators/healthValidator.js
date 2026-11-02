import { query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';

/**
 * Health check query validation rules.
 */
export const validateHealthQuery = [
  query('verbose')
    .optional()
    .isBoolean()
    .withMessage('verbose query parameter must be a boolean (true/false)'),
  validateRequest
];

export default {
  validateHealthQuery
};
