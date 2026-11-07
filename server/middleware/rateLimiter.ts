import rateLimit from 'express-rate-limit';

/**
 * Public Form Submission Rate Limiter
 * 40 submissions per 15 minutes per IP
 */
export const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

/**
 * Admin Login Rate Limiter
 * 10 attempts per 15 minutes per IP to block brute-force attempts
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many failed login attempts. Please wait 15 minutes before retrying.',
  },
});
