import bcrypt from 'bcrypt';
import { config } from '../config/env.js';

/**
 * Hash a plain text password with salt rounds.
 * @param {string} plainPassword
 * @returns {Promise<string>} hashed password
 */
export const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, config.bcrypt.saltRounds);
};

/**
 * Compare plain text password against stored hash.
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export default {
  hashPassword,
  comparePassword
};
