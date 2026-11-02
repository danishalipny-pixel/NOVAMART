/**
 * Production Security Headers Middleware.
 * Hardens HTTP response headers against clickjacking, MIME-sniffing, and context leaks.
 */
export const securityHeaders = (req, res, next) => {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Mitigate clickjacking attacks (frame embedding only from same origin)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Modern browser defense disabling obsolete reflected XSS filtering
  res.setHeader('X-XSS-Protection', '0');

  // Control referrer information leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cross-Origin policies
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  // Remove Express server identifier
  res.removeHeader('X-Powered-By');

  next();
};

export default securityHeaders;
