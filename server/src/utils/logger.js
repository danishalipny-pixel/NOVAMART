/**
 * Lightweight, structured logger for NOVAMART backend.
 */

const formatTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, meta = '') => {
    console.log(`[${formatTimestamp()}] [INFO] ${message}`, meta ? meta : '');
  },
  warn: (message, meta = '') => {
    console.warn(`[${formatTimestamp()}] [WARN] ${message}`, meta ? meta : '');
  },
  error: (message, error = '') => {
    console.error(`[${formatTimestamp()}] [ERROR] ${message}`, error ? error : '');
  },
  debug: (message, meta = '') => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${formatTimestamp()}] [DEBUG] ${message}`, meta ? meta : '');
    }
  }
};

export default logger;
