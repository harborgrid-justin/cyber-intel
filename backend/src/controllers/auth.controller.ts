import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RbacEngine } from '../services/security/rbac.engine';
import { logger } from '../utils/logger';

/**
 * Authentication Controller
 * Handles all authentication-related HTTP requests
 */

/**
 * POST /auth/login
 * Authenticate user and return JWT tokens
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await AuthService.login(username, password, ipAddress, userAgent);

    // Set refresh token as httpOnly cookie (more secure)
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          roleId: result.user.role_id,
          organizationId: result.user.organization_id,
          clearance: result.user.clearance,
          isVip: result.user.is_vip,
          mfaEnabled: result.user.mfa_enabled
        },
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
        permissions: result.permissions
      }
    });
  } catch (error: any) {
    logger.error('[Auth Controller] Login error', error);

    // Handle special MFA required case
    if (error.message === 'MFA_REQUIRED') {
      return res.status(403).json({
        error: 'MFA_REQUIRED',
        message: 'Multi-factor authentication is required'
      });
    }

    res.status(401).json({
      error: error.message || 'Authentication failed'
    });
  }
};

/**
 * POST /auth/register
 * Register a new user account
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, roleId, organizationId } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required'
      });
    }

    const createdBy = req.user?.username;

    const user = await AuthService.register(
      { username, email, password, roleId, organizationId },
      createdBy
    );

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.role_id,
        status: user.status
      },
      message: 'User registered successfully'
    });
  } catch (error: any) {
    logger.error('[Auth Controller] Registration error', error);
    res.status(400).json({
      error: error.message || 'Registration failed'
    });
  }
};

/**
 * POST /auth/logout
 * Logout user and invalidate tokens
 */
export const logout = async (req: Request, res: Response) => {
  try {
    if (req.user) {
      await AuthService.logout(req.user.id);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    logger.error('[Auth Controller] Logout error', error);
    res.status(500).json({
      error: 'Logout failed'
    });
  }
};

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Try to get refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token is required'
      });
    }

    const tokens = await AuthService.refreshAccessToken(refreshToken);

    // Update refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      }
    });
  } catch (error: any) {
    logger.error('[Auth Controller] Token refresh error', error);
    res.status(401).json({
      error: error.message || 'Token refresh failed'
    });
  }
};

/**
 * POST /auth/forgot-password
 * Initiate password reset process
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    const resetToken = await AuthService.initiatePasswordReset(email);

    // In production, this would send an email
    // For development, we return the token (remove in production!)
    const response: any = {
      success: true,
      message: 'If the email exists, a reset link has been sent'
    };

    if (process.env.NODE_ENV === 'development') {
      response.resetToken = resetToken; // Only for development
    }

    res.json(response);
  } catch (error: any) {
    logger.error('[Auth Controller] Forgot password error', error);
    res.status(500).json({
      error: 'Password reset initiation failed'
    });
  }
};

/**
 * POST /auth/reset-password
 * Reset password using reset token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Reset token and new password are required'
      });
    }

    await AuthService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    logger.error('[Auth Controller] Password reset error', error);
    res.status(400).json({
      error: error.message || 'Password reset failed'
    });
  }
};

/**
 * GET /auth/me
 * Get current authenticated user information
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get fresh permissions
    const permissionSet = await RbacEngine.getEffectivePermissions(req.user.id);
    const permissions = Array.from(permissionSet);

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          roleId: req.user.role_id,
          organizationId: req.user.organization_id,
          clearance: req.user.clearance,
          status: req.user.status,
          isVip: req.user.is_vip,
          mfaEnabled: req.user.mfa_enabled,
          lastLogin: req.user.last_login
        },
        permissions
      }
    });
  } catch (error: any) {
    logger.error('[Auth Controller] Get current user error', error);
    res.status(500).json({
      error: 'Failed to retrieve user information'
    });
  }
};

/**
 * PUT /auth/profile
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { email, currentPassword, newPassword } = req.body;

    const updatedUser = await AuthService.updateProfile(req.user.id, {
      email,
      currentPassword,
      newPassword
    });

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email
      },
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    logger.error('[Auth Controller] Profile update error', error);
    res.status(400).json({
      error: error.message || 'Profile update failed'
    });
  }
};

/**
 * POST /auth/mfa/enable
 * Enable multi-factor authentication
 */
export const enableMFA = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const mfaData = await AuthService.enableMFA(req.user.id);

    res.json({
      success: true,
      data: mfaData,
      message: 'MFA enabled successfully. Scan the QR code with your authenticator app'
    });
  } catch (error: any) {
    logger.error('[Auth Controller] MFA enable error', error);
    res.status(500).json({
      error: error.message || 'Failed to enable MFA'
    });
  }
};

/**
 * POST /auth/mfa/disable
 * Disable multi-factor authentication
 */
export const disableMFA = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'Password is required to disable MFA'
      });
    }

    await AuthService.disableMFA(req.user.id, password);

    res.json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (error: any) {
    logger.error('[Auth Controller] MFA disable error', error);
    res.status(400).json({
      error: error.message || 'Failed to disable MFA'
    });
  }
};

/**
 * POST /auth/validate-session
 * Validate current session
 */
export const validateSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        valid: false,
        error: 'Not authenticated'
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        valid: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const valid = await AuthService.validateSession(req.user.id, token);

    res.json({
      success: true,
      valid,
      userId: req.user.id
    });
  } catch (error: any) {
    logger.error('[Auth Controller] Session validation error', error);
    res.status(500).json({
      valid: false,
      error: 'Session validation failed'
    });
  }
};
