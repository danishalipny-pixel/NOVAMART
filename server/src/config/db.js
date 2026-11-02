import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

/**
 * Connect to MongoDB with resilient configuration and event tracking.
 */
export const connectDB = async () => {
  if (isConnected) {
    logger.info('Using existing MongoDB connection');
    return mongoose.connection;
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    autoIndex: config.isDevelopment // Build indexes automatically in development
  };

  try {
    const conn = await mongoose.connect(config.mongoUri, options);
    isConnected = true;
    logger.info(`MongoDB connected successfully to host: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    logger.error('MongoDB connection attempt failed:', error.message);
    logger.warn('Server will continue running in API-ready mode. Ensure MongoDB is running and MONGODB_URI is correct.');
    return null;
  }
};

// Mongoose Connection Event Listeners
mongoose.connection.on('connected', () => {
  isConnected = true;
  logger.info('Mongoose event: MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  logger.error('Mongoose event: MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('Mongoose event: MongoDB disconnected');
});

/**
 * Returns current database connection state.
 */
export const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    statusCode: stateCode,
    isConnected: stateCode === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};

/**
 * Graceful database disconnect helper.
 */
export const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected cleanly via disconnectDB');
  }
};

export default {
  connectDB,
  getConnectionStatus,
  disconnectDB
};
