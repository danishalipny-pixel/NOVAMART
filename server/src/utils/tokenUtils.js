import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generate an access JWT token.
 * @param {object} payload - { userId, role, email }
 * @returns {string} signed JWT
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * Generate a refresh JWT token.
 * @param {object} payload - { userId }
 * @returns {string} signed JWT
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

/**
 * Verify an access JWT token.
 * @param {string} token
 * @returns {object} decoded payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Verify a refresh JWT token.
 * @param {string} token
 * @returns {object} decoded payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
