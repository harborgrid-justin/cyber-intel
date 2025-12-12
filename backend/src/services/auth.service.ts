import * as crypto from 'crypto';
import { User, Role, Permission } from '../models/system';
import { RbacEngine } from './security/rbac.engine';
import { AuditService } from './audit.service';
import { logger } from '../utils/logger';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'sentinel-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const PASSWORD_MIN_LENGTH = 12;

interface TokenPayload {
  userId: string;
  username: string;
  roleId: string;
  organizationId: string;
  iat?: number;
  exp?: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface LoginResult {
  user: User;
  tokens: AuthTokens;
  permissions: string[];
}

export class AuthService {

  /**
   * Password hashing using PBKDF2 (crypto built-in - production would use bcrypt)
   * NIST SP 800-132 compliant key derivation
   */
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verify password against stored hash
   */
  static verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  /**
   * Validate password complexity requirements
   * Based on NIST SP 800-63B Digital Identity Guidelines
   */
  static validatePasswordComplexity(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common patterns
    const commonPatterns = ['password', '12345', 'qwerty', 'admin', 'sentinel'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      errors.push('Password contains common patterns and is not secure');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate JWT access token
   */
  static generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      roleId: user.role_id,
      organizationId: user.organization_id
    };

    // Simple JWT implementation (production would use jsonwebtoken library)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiry(JWT_EXPIRY)
    })).toString('base64url');

    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Verify and decode JWT token
   */
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const [header, payload, signature] = token.split('.');

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        logger.warn('[Auth] Invalid token signature');
        return null;
      }

      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());

      // Check expiry
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        logger.warn('[Auth] Token expired');
        return null;
      }

      return decoded;
    } catch (error) {
      logger.error('[Auth] Token verification failed', error);
      return null;
    }
  }

  /**
   * Parse expiry string to seconds (e.g., '1h', '7d')
   */
  private static parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 3600; // Default 1 hour
    }
  }

  /**
   * User login with security checks
   */
  static async login(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
    try {
      // Find user
      const user = await (User as any).findOne({
        where: { username },
        include: [{ model: Role, include: [Permission] }]
      });

      if (!user) {
        await AuditService.logAuthEvent('LOGIN_FAILED', username, ipAddress, 'User not found');
        throw new Error('Invalid credentials');
      }

      // Check account status
      if (user.status === 'LOCKED') {
        // Check if lockout period has expired
        const lockoutExpiry = new Date(user.locked_until || 0);
        if (lockoutExpiry > new Date()) {
          const minutesLeft = Math.ceil((lockoutExpiry.getTime() - Date.now()) / 60000);
          await AuditService.logAuthEvent('LOGIN_BLOCKED', username, ipAddress, 'Account locked');
          throw new Error(`Account locked. Try again in ${minutesLeft} minutes`);
        } else {
          // Reset lockout
          user.status = 'ACTIVE';
          user.failed_login_attempts = 0;
          user.locked_until = null;
          await (user as any).save();
        }
      }

      if (user.status === 'DISABLED') {
        await AuditService.logAuthEvent('LOGIN_BLOCKED', username, ipAddress, 'Account disabled');
        throw new Error('Account is disabled');
      }

      // Verify password
      if (!user.password_hash || !this.verifyPassword(password, user.password_hash)) {
        // Increment failed attempts
        user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;

        if (user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS) {
          user.status = 'LOCKED';
          user.locked_until = new Date(Date.now() + LOCKOUT_DURATION);
          await (user as any).save();
          await AuditService.logAuthEvent('ACCOUNT_LOCKED', username, ipAddress,
            `Too many failed attempts (${user.failed_login_attempts})`);
          throw new Error('Too many failed login attempts. Account locked for 15 minutes');
        }

        await (user as any).save();
        await AuditService.logAuthEvent('LOGIN_FAILED', username, ipAddress,
          `Invalid password (attempt ${user.failed_login_attempts}/${MAX_LOGIN_ATTEMPTS})`);
        throw new Error('Invalid credentials');
      }

      // Check MFA if enabled
      if (user.mfa_enabled && !user.mfa_verified) {
        // In a real implementation, this would trigger MFA verification flow
        await AuditService.logAuthEvent('MFA_REQUIRED', username, ipAddress);
        throw new Error('MFA_REQUIRED'); // Special error code for frontend
      }

      // Successful login - reset failed attempts
      user.failed_login_attempts = 0;
      user.last_login = new Date();
      user.last_login_ip = ipAddress;
      user.last_login_user_agent = userAgent;

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken();

      // Store refresh token
      user.refresh_token = refreshToken;
      user.refresh_token_expires = new Date(Date.now() + this.parseExpiry(REFRESH_TOKEN_EXPIRY) * 1000);
      await (user as any).save();

      // Get permissions
      const permissionSet = await RbacEngine.getEffectivePermissions(user.id);
      const permissions = Array.from(permissionSet);

      // Log successful login
      await AuditService.logAuthEvent('LOGIN_SUCCESS', username, ipAddress,
        `Role: ${user.role?.name || 'Unknown'}`);

      logger.info(`[Auth] User ${username} logged in successfully from ${ipAddress}`);

      return {
        user,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: this.parseExpiry(JWT_EXPIRY)
        },
        permissions
      };
    } catch (error: any) {
      logger.error('[Auth] Login error', error);
      throw error;
    }
  }

  /**
   * User registration
   */
  static async register(data: {
    username: string;
    email: string;
    password: string;
    roleId?: string;
    organizationId?: string;
  }, createdBy?: string): Promise<User> {
    try {
      // Validate password
      const passwordValidation = this.validatePasswordComplexity(data.password);
      if (!passwordValidation.valid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Check if username exists
      const existingUser = await (User as any).findOne({ where: { username: data.username } });
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Check if email exists
      const existingEmail = await (User as any).findOne({ where: { email: data.email } });
      if (existingEmail) {
        throw new Error('Email already exists');
      }

      // Hash password
      const passwordHash = this.hashPassword(data.password);

      // Generate user ID
      const userId = `USR-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

      // Create user
      const user = await (User as any).create({
        id: userId,
        username: data.username,
        email: data.email,
        password_hash: passwordHash,
        role_id: data.roleId || 'ROLE-VIEWER', // Default to viewer role
        organization_id: data.organizationId || 'ORG-DEFAULT',
        status: 'ACTIVE',
        clearance: 'UNCLASSIFIED',
        is_vip: false,
        failed_login_attempts: 0,
        mfa_enabled: false
      });

      await AuditService.logAuthEvent('USER_REGISTERED', data.username, undefined,
        `Created by: ${createdBy || 'self-registration'}`);

      logger.info(`[Auth] New user registered: ${data.username} (${userId})`);

      return user;
    } catch (error: any) {
      logger.error('[Auth] Registration error', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const user = await (User as any).findOne({
        where: { refresh_token: refreshToken },
        include: [Role]
      });

      if (!user) {
        throw new Error('Invalid refresh token');
      }

      // Check if refresh token is expired
      if (user.refresh_token_expires && new Date(user.refresh_token_expires) < new Date()) {
        user.refresh_token = null;
        user.refresh_token_expires = null;
        await (user as any).save();
        throw new Error('Refresh token expired');
      }

      // Generate new tokens
      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken();

      user.refresh_token = newRefreshToken;
      user.refresh_token_expires = new Date(Date.now() + this.parseExpiry(REFRESH_TOKEN_EXPIRY) * 1000);
      await (user as any).save();

      logger.info(`[Auth] Token refreshed for user ${user.username}`);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.parseExpiry(JWT_EXPIRY)
      };
    } catch (error: any) {
      logger.error('[Auth] Token refresh error', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(userId: string): Promise<void> {
    try {
      const user = await (User as any).findByPk(userId);
      if (user) {
        user.refresh_token = null;
        user.refresh_token_expires = null;
        await (user as any).save();

        await AuditService.logAuthEvent('LOGOUT', user.username, undefined);
        logger.info(`[Auth] User ${user.username} logged out`);
      }
    } catch (error: any) {
      logger.error('[Auth] Logout error', error);
      throw error;
    }
  }

  /**
   * Initiate password reset
   */
  static async initiatePasswordReset(email: string): Promise<string> {
    try {
      const user = await (User as any).findOne({ where: { email } });

      if (!user) {
        // Don't reveal if email exists (security best practice)
        logger.warn(`[Auth] Password reset requested for non-existent email: ${email}`);
        return 'If the email exists, a reset link has been sent';
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.password_reset_token = resetTokenHash;
      user.password_reset_expires = new Date(Date.now() + 3600000); // 1 hour
      await (user as any).save();

      await AuditService.logAuthEvent('PASSWORD_RESET_REQUEST', user.username, undefined);

      logger.info(`[Auth] Password reset initiated for ${user.username}`);

      // In production, send email with reset token
      // For now, return the token (in production, this would be in the email)
      return resetToken;
    } catch (error: any) {
      logger.error('[Auth] Password reset initiation error', error);
      throw error;
    }
  }

  /**
   * Reset password using reset token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Validate new password
      const passwordValidation = this.validatePasswordComplexity(newPassword);
      if (!passwordValidation.valid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Hash token
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid reset token
      const user = await (User as any).findOne({
        where: { password_reset_token: resetTokenHash }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      if (user.password_reset_expires && new Date(user.password_reset_expires) < new Date()) {
        user.password_reset_token = null;
        user.password_reset_expires = null;
        await (user as any).save();
        throw new Error('Reset token has expired');
      }

      // Update password
      user.password_hash = this.hashPassword(newPassword);
      user.password_reset_token = null;
      user.password_reset_expires = null;
      user.failed_login_attempts = 0;
      user.status = 'ACTIVE'; // Unlock account if it was locked
      await (user as any).save();

      await AuditService.logAuthEvent('PASSWORD_RESET_SUCCESS', user.username, undefined);

      logger.info(`[Auth] Password reset successful for ${user.username}`);
    } catch (error: any) {
      logger.error('[Auth] Password reset error', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: {
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User> {
    try {
      const user = await (User as any).findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // If changing password, verify current password
      if (updates.newPassword) {
        if (!updates.currentPassword) {
          throw new Error('Current password is required to change password');
        }

        if (!this.verifyPassword(updates.currentPassword, user.password_hash)) {
          throw new Error('Current password is incorrect');
        }

        const passwordValidation = this.validatePasswordComplexity(updates.newPassword);
        if (!passwordValidation.valid) {
          throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
        }

        user.password_hash = this.hashPassword(updates.newPassword);
        await AuditService.logAuthEvent('PASSWORD_CHANGED', user.username, undefined);
      }

      // Update email if provided
      if (updates.email && updates.email !== user.email) {
        // Check if email already exists
        const existingEmail = await (User as any).findOne({
          where: { email: updates.email }
        });
        if (existingEmail && existingEmail.id !== userId) {
          throw new Error('Email already exists');
        }
        user.email = updates.email;
        await AuditService.logAuthEvent('EMAIL_CHANGED', user.username, undefined,
          `New email: ${updates.email}`);
      }

      await (user as any).save();
      logger.info(`[Auth] Profile updated for ${user.username}`);

      return user;
    } catch (error: any) {
      logger.error('[Auth] Profile update error', error);
      throw error;
    }
  }

  /**
   * Enable MFA for user
   */
  static async enableMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      const user = await (User as any).findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate MFA secret (in production, use speakeasy or similar)
      const secret = crypto.randomBytes(20).toString('base64');

      user.mfa_secret = secret;
      user.mfa_enabled = true;
      await (user as any).save();

      await AuditService.logAuthEvent('MFA_ENABLED', user.username, undefined);

      logger.info(`[Auth] MFA enabled for ${user.username}`);

      // In production, return QR code for authenticator app
      return {
        secret,
        qrCode: `otpauth://totp/SENTINEL:${user.username}?secret=${secret}&issuer=SENTINEL`
      };
    } catch (error: any) {
      logger.error('[Auth] MFA enable error', error);
      throw error;
    }
  }

  /**
   * Disable MFA for user
   */
  static async disableMFA(userId: string, password: string): Promise<void> {
    try {
      const user = await (User as any).findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify password before disabling MFA
      if (!this.verifyPassword(password, user.password_hash)) {
        throw new Error('Invalid password');
      }

      user.mfa_secret = null;
      user.mfa_enabled = false;
      await (user as any).save();

      await AuditService.logAuthEvent('MFA_DISABLED', user.username, undefined);

      logger.info(`[Auth] MFA disabled for ${user.username}`);
    } catch (error: any) {
      logger.error('[Auth] MFA disable error', error);
      throw error;
    }
  }

  /**
   * Validate session
   */
  static async validateSession(userId: string, token: string): Promise<boolean> {
    try {
      const payload = this.verifyAccessToken(token);
      if (!payload || payload.userId !== userId) {
        return false;
      }

      const user = await (User as any).findByPk(userId);
      if (!user || user.status !== 'ACTIVE') {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
