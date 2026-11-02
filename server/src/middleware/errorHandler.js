import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

/**
 * Centralized express error handler middleware.
 */
export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let error = err;

  // Log error with request context
  logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, err.stack || '');

  // Handle Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = ApiError.badRequest(message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const formattedErrors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message
    }));
    error = ApiError.unprocessable('Validation Error', formattedErrors);
  }

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `Duplicate value '${value}' entered for unique field '${field}'`;
    error = ApiError.conflict(message);
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authorization token');
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authorization token has expired');
  }

  // Handle malformed JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = ApiError.badRequest('Malformed JSON in request body');
  }

  // Fallback to internal error if not an ApiError instance
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message);
  }

  const responsePayload = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    timestamp: error.timestamp || new Date().toISOString(),
    ...(config.isDevelopment && { stack: error.stack })
  };

  res.status(error.statusCode).json(responsePayload);
};

export default errorHandler;
