import { ApiError } from '../utils/ApiError.js';

/**
 * In-memory sliding window rate limiter factory.
 * Provides granular request throttling per client IP address.
 */
export const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // default 15 minutes
  const max = options.max || 100;
  const message = options.message || 'Too many requests from this IP, please try again later';

  // Map of ip -> { count, resetTime }
  const clients = new Map();

  // Periodic cleanup of expired clients every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of clients.entries()) {
      if (now >= data.resetTime) {
        clients.delete(ip);
      }
    }
  }, Math.min(windowMs, 5 * 60 * 1000));

  // Allow test environments / unref to not block process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // Determine client IP (supporting reverse proxies and forwarded headers)
    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    const now = Date.now();
    let client = clients.get(clientIp);

    if (!client || now >= client.resetTime) {
      client = {
        count: 1,
        resetTime: now + windowMs
      };
      clients.set(clientIp, client);
    } else {
      client.count++;
    }

    const remaining = Math.max(0, max - client.count);
    const resetSeconds = Math.ceil((client.resetTime - now) / 1000);

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (client.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return next(ApiError.tooManyRequests(message));
    }

    next();
  };
};

// Specialized limiters for sensitive operations
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts from this IP, please try again in 15 minutes.'
});

export const paymentLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Payment attempt rate limit exceeded, please wait before initiating new payments.'
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'High traffic volume detected from this client, please slow down your requests.'
});

export default {
  createRateLimiter,
  authLimiter,
  paymentLimiter,
  apiLimiter
};
