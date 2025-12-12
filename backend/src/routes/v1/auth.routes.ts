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
 */

// POST /auth/login - User login
router.post('/login', validate(loginSchema), login);

// POST /auth/register - User registration (public or admin-only depending on config)
// In production, you might want to add requirePermission('user', 'manage') for admin-only registration
router.post('/register', validate(registerSchema), register);

// POST /auth/refresh - Refresh access token
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// POST /auth/forgot-password - Initiate password reset
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

// POST /auth/reset-password - Complete password reset
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

/**
 * Protected Routes (Authentication required)
 */

// POST /auth/logout - User logout
router.post('/logout', authenticate, logout);

// GET /auth/me - Get current user information
router.get('/me', authenticate, getCurrentUser);

// PUT /auth/profile - Update user profile
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

// POST /auth/mfa/enable - Enable MFA
router.post('/mfa/enable', authenticate, enableMFA);

// POST /auth/mfa/disable - Disable MFA
router.post('/mfa/disable', authenticate, validate(disableMFASchema), disableMFA);

// POST /auth/validate-session - Validate current session
router.post('/validate-session', authenticate, validateSession);

export default router;
