
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
 * Implements defense-in-depth security checks
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.debug(`[Auth] No Authorization header from ${req.ip}`);
      res.status(401).json({ error: 'No Authorization header provided' });
      return;
    }

    // Validate header format
    if (!authHeader.startsWith('Bearer ')) {
      logger.debug(`[Auth] Invalid Authorization header format from ${req.ip}`);
      res.status(401).json({ error: 'Invalid Authorization header format. Use: Bearer <token>' });
      return;
    }

    // Extract token
    const token = authHeader.substring(7);

    // Validate token length (basic sanity check)
    if (!token || token.length < 10) {
      logger.warn(`[Auth] Token too short from ${req.ip}`);
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }

    // Verify JWT token signature and expiration
    const payload = AuthService.verifyAccessToken(token);

    if (!payload) {
      logger.warn(`[Auth] Invalid or expired token from ${req.ip}`);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Validate payload structure
    if (!payload.userId || !payload.username) {
      logger.error(`[Auth] Malformed token payload from ${req.ip}`);
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    // Load user from database with role information
    const user = await (User as any).findByPk(payload.userId, {
      include: [Role]
    });

    if (!user) {
      logger.warn(`[Auth] User ${payload.userId} not found (token may be stale)`);
      res.status(401).json({ error: 'User not found or has been deleted' });
      return;
    }

    // Verify username matches (prevents token reuse across accounts)
    if (user.username !== payload.username) {
      logger.error(`[Auth] Username mismatch for user ${payload.userId}. Possible token tampering.`);
      await AuditService.logAuthEvent(
        'SECURITY_ALERT',
        payload.username,
        req.ip,
        'Username mismatch in token - possible tampering'
      );
      res.status(401).json({ error: 'Token validation failed' });
      return;
    }

    // Check user account status
    if (user.status !== 'ACTIVE') {
      logger.warn(`[Auth] User ${user.username} attempted access with status: ${user.status}`);
      await AuditService.logAuthEvent(
        'LOGIN_BLOCKED',
        user.username,
        req.ip,
        `Account status: ${user.status}`
      );

      const message = user.status === 'LOCKED'
        ? 'Account is locked. Please contact support or wait for the lockout period to expire.'
        : user.status === 'DISABLED'
        ? 'Account has been disabled. Please contact support.'
        : 'Account is not active';

      res.status(403).json({ error: message });
      return;
    }

    // Load permissions with caching for RBAC
    const permissions = await RbacEngine.getEffectivePermissions(user.id);

    // Attach user and permissions to request object
    req.user = user;
    req.permissions = permissions;

    // Log successful authentication (debug level)
    logger.debug(`[Auth] User ${user.username} authenticated successfully`);

    // Continue to next middleware
    next();
  } catch (error: any) {
    // Catch any unexpected errors
    logger.error('[Auth] Unexpected authentication error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(401).json({ error: 'Authentication failed' });
    return;
  }
};

/**
 * RBAC Enforcement Middleware
 * Verifies if the authenticated user has the specific permission required
 * Supports wildcard permissions and detailed access logging
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.permissions) {
        logger.warn(`[RBAC] Unauthenticated access attempt to ${resource}:${action} from ${req.ip}`);
        res.status(401).json({
          error: 'Authentication required',
          message: 'You must be logged in to access this resource'
        });
        return;
      }

      const requiredPerm = `${resource}:${action}`;

      // Check for exact permission match
      if (req.permissions.has(requiredPerm)) {
        logger.debug(`[RBAC] Access granted: ${req.user.username} -> ${requiredPerm}`);
        next();
        return;
      }

      // Check for super admin permission (god mode)
      if (req.permissions.has('*:*')) {
        logger.debug(`[RBAC] Super admin access: ${req.user.username} -> ${requiredPerm}`);
        next();
        return;
      }

      // Check for resource wildcard (e.g., "case:*" allows all case operations)
      if (req.permissions.has(`${resource}:*`)) {
        logger.debug(`[RBAC] Resource wildcard access: ${req.user.username} -> ${requiredPerm}`);
        next();
        return;
      }

      // Check for action wildcard (e.g., "*:read" allows read on all resources)
      if (req.permissions.has(`*:${action}`)) {
        logger.debug(`[RBAC] Action wildcard access: ${req.user.username} -> ${requiredPerm}`);
        next();
        return;
      }

      // Permission denied - log and reject
      logger.warn(`[RBAC] Access Denied: User ${req.user.username} (${req.user.role_id}) attempted ${requiredPerm} from ${req.ip}`);
      await AuditService.logAuthEvent(
        'ACCESS_DENIED',
        req.user.username,
        req.ip,
        `Attempted: ${requiredPerm}`
      );

      res.status(403).json({
        error: 'Insufficient privileges',
        message: `You do not have permission to ${action} ${resource}`,
        required: requiredPerm
      });
      return;
    } catch (error: any) {
      logger.error('[RBAC] Permission check error', {
        error: error.message,
        resource,
        action,
        user: req.user?.username
      });
      res.status(500).json({ error: 'Authorization check failed' });
      return;
    }
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
