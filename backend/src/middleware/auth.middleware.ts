
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { RbacEngine } from '../services/security/rbac.engine';
import { User, Role } from '../models/system';
import { AuthService } from '../services/auth.service';
import { AuditService } from '../services/audit.service';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      permissions?: Set<string>;
    }
  }
}

/**
 * Authentication Middleware
 * Verifies JWT token and loads user context with permissions
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No Authorization header provided' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid Authorization header format' });
  }

  try {
    // Extract token
    const token = authHeader.substring(7);

    // Verify JWT token
    const payload = AuthService.verifyAccessToken(token);

    if (!payload) {
      logger.warn(`[Auth] Invalid or expired token from ${req.ip}`);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Load user from database
    const user = await (User as any).findByPk(payload.userId, {
      include: [Role]
    });

    if (!user) {
      logger.warn(`[Auth] User ${payload.userId} not found`);
      return res.status(401).json({ error: 'User not found' });
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      logger.warn(`[Auth] User ${user.username} attempted access with status: ${user.status}`);
      await AuditService.logAuthEvent(
        'LOGIN_BLOCKED',
        user.username,
        req.ip,
        `Account status: ${user.status}`
      );
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Load permissions with caching
    const permissions = await RbacEngine.getEffectivePermissions(user.id);

    // Attach user and permissions to request
    req.user = user;
    req.permissions = permissions;

    // Continue to next middleware
    next();
  } catch (error: any) {
    logger.error('[Auth] Authentication error', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * RBAC Enforcement Middleware
 * Verifies if the authenticated user has the specific permission required.
 */
export const requirePermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.permissions) {
        return res.status(401).json({ error: 'Unauthenticated' });
    }

    const requiredPerm = `${resource}:${action}`;
    const hasPermission = req.permissions.has(requiredPerm) || req.permissions.has('*:*');

    if (!hasPermission) {
        logger.warn(`[RBAC] Access Denied: User ${req.user.username} attempted ${requiredPerm}`);
        return res.status(403).json({ error: 'Insufficient Privileges' });
    }

    next();
  };
};

/**
 * Legacy Clearance Check (Deprecated, mapped to RBAC)
 */
export const requireClearance = (level: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Map clearance levels to rough RBAC equivalents for backward compatibility
    if (level === 'ADMIN') return requirePermission('system', 'admin')(req, res, next);
    if (level === 'SECRET') return requirePermission('intel', 'read_secret')(req, res, next);
    next();
  };
};
