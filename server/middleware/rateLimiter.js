const rateLimit = require('express-rate-limit');

/**
 * Creates a configurable rate limiter
 * @param {number} maxRequests - Maximum number of requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @param {string} message - Custom error message
 * @returns {Function} Express rate limiter middleware
 */
function createRateLimiter(maxRequests, windowSeconds, message = 'Too many requests, please try again later') {
  return rateLimit({
    windowMs: windowSeconds * 1000,
    max: maxRequests,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests in some cases 
    skipSuccessfulRequests: false,
    // Handler for when limit is reached
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowSeconds / 60) + ' minutes'
      });
    }
  });
}

// Predefined limiters for common use cases
const rateLimiters = {
  // Relaxed for development testing
  auth: createRateLimiter(
    100,         // 100 attempts
    5 * 60,      // per 5 minutes
    'Too many login attempts. Please try again after 15 minutes.'
  ),
  
  // General API limiter
  api: createRateLimiter(
    100,        // 100 requests
    60,         // per minute
    'Too many requests. Please slow down.'
  ),
  
  // File upload limiter
  upload: createRateLimiter(
    50,         // 50 uploads
    60,         // per minute
    'Too many upload requests. Please try again later.'
  ),
  
  // Stricter limiter for sensitive operations
  sensitive: createRateLimiter(
    10,         // 10 requests
    60,         // per minute
    'Rate limit exceeded for this operation.'
  )
};

module.exports = { createRateLimiter, rateLimiters };
