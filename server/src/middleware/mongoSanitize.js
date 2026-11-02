/**
 * NoSQL Injection Protection Middleware.
 * Recursively inspects and sanitizes request bodies, query strings, and parameters
 * by removing keys containing prohibited characters ($ and .) used in MongoDB query operators.
 */

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object' || Buffer.isBuffer(obj)) return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    // Strip keys starting with $ or containing . (e.g. $gt, $ne, $where)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeObject(val);
  }
  return clean;
}

export const mongoSanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

export default mongoSanitize;
