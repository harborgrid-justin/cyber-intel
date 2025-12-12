
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Default Rate Limiter: 100 requests per 15 minutes
 */
export const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict Rate Limiter: 20 requests per 15 minutes (for sensitive operations)
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Rate limit exceeded for this operation.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Login Rate Limiter: 5 login attempts per 15 minutes
 * Strict rate limiting for login attempts to prevent brute force attacks
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all attempts
});

/**
 * Registration Rate Limiter: 3 registration attempts per hour
 * Prevent spam account creation
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: 'Too many registration attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password Reset Rate Limiter: 3 attempts per hour
 * Prevent password reset abuse
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: 'Too many password reset attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Token Refresh Rate Limiter: 10 refresh attempts per hour
 * More lenient than login but still protected
 */
export const refreshTokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many token refresh attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth Rate Limiter (General): 20 attempts per 15 minutes
 * For other authenticated operations
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Bulk Operations Rate Limiter: 10 requests per hour
 */
export const bulkOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Bulk operation limit exceeded. Please wait before retrying.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Export Rate Limiter: 20 exports per hour
 */
export const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Export limit exceeded. Please wait before retrying.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Search Rate Limiter: 50 searches per 15 minutes
 */
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Search limit exceeded. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
