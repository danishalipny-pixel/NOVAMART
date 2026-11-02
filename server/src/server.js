import app from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';

let activeServer = null;

export const startServer = async () => {
  try {
    logger.info('Initializing NOVAMART API Server...');
    logger.info(`Environment: ${config.env}`);

    // Connect to MongoDB
    await connectDB();

    // Start Express listener
    return new Promise((resolve) => {
      activeServer = app.listen(config.port, () => {
        logger.info(`🚀 NOVAMART Server listening on port ${config.port}`);
        logger.info(`👉 Health Check: http://localhost:${config.port}/api/v1/health`);
        logger.info(`👉 API Discovery: http://localhost:${config.port}/api/v1`);
        resolve(activeServer);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
export const stopServer = async (signal = 'SIGTERM') => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  if (activeServer) {
    return new Promise((resolve) => {
      activeServer.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        logger.info('Graceful shutdown completed.');
        activeServer = null;
        resolve();
      });
    });
  }
  return Promise.resolve();
};

process.on('SIGINT', async () => {
  await stopServer('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopServer('SIGTERM');
  process.exit(0);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at:', promise);
  logger.error('Reason:', reason);
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

// Start automatically
startServer();

export { app, activeServer };
export default startServer;
