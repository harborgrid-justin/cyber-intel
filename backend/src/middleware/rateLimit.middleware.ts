
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
 * Auth Rate Limiter: 5 attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
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
