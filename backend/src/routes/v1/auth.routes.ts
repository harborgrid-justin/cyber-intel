import { Router } from 'express';
import {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  enableMFA,
  disableMFA,
  validateSession
} from '../../controllers/auth.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  refreshTokenLimiter,
  authLimiter
} from '../../middleware/rateLimit.middleware';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  disableMFASchema
} from '../../schemas/auth.schema';

const router = Router();

/**
 * Public Routes (No authentication required)
 * All auth endpoints have strict rate limiting to prevent abuse
 */

// POST /auth/login - User login
// Rate limited: 5 attempts per 15 minutes
router.post('/login', loginLimiter, validate(loginSchema), login);

// POST /auth/register - User registration (public or admin-only depending on config)
// Rate limited: 3 attempts per hour
// In production, you might want to add requirePermission('user', 'manage') for admin-only registration
router.post('/register', registerLimiter, validate(registerSchema), register);

// POST /auth/refresh - Refresh access token
// Rate limited: 10 attempts per hour
router.post('/refresh', refreshTokenLimiter, validate(refreshTokenSchema), refreshToken);

// POST /auth/forgot-password - Initiate password reset
// Rate limited: 3 attempts per hour
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);

// POST /auth/reset-password - Complete password reset
// Rate limited: 3 attempts per hour
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), resetPassword);

/**
 * Protected Routes (Authentication required)
 * These routes require valid authentication and have moderate rate limiting
 */

// POST /auth/logout - User logout
router.post('/logout', authenticate, authLimiter, logout);

// GET /auth/me - Get current user information
router.get('/me', authenticate, getCurrentUser);

// PUT /auth/profile - Update user profile
router.put('/profile', authenticate, authLimiter, validate(updateProfileSchema), updateProfile);

// POST /auth/mfa/enable - Enable MFA
router.post('/mfa/enable', authenticate, authLimiter, enableMFA);

// POST /auth/mfa/disable - Disable MFA
router.post('/mfa/disable', authenticate, authLimiter, validate(disableMFASchema), disableMFA);

// POST /auth/validate-session - Validate current session
router.post('/validate-session', authenticate, validateSession);

export default router;
