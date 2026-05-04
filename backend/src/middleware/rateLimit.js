// backend/src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

// Different limits for different endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: { status: 'error', message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test', // Skip rate limiting in tests
});

const relaxedLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { status: 'error', message: 'Too many requests, slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: { status: 'error', message: 'Too many login attempts, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { strictLimiter, relaxedLimiter, authLimiter };