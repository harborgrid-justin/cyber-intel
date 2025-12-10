
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { RbacEngine } from '../services/security/rbac.engine';
import { User, Role } from '../models/system';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      permissions?: Set<string>;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No Authorization header provided' });
  }

  // TODO: Replace with real JWT verification logic
  // Simulation: "Bearer mock-token" maps to admin
  if (authHeader.startsWith('Bearer ')) {
    // In prod, decode JWT to get userId
    // For demo, we hydrate the mock admin user from the database or create a transient one
    try {
        // Mock ID for the seeded admin
        const userId = 'USR-ADMIN'; 
        const user = await (User as any).findByPk(userId);
        
        if (user) {
            req.user = user;
            req.permissions = await RbacEngine.getEffectivePermissions(userId);
            return next();
        }
    } catch (e) {
        logger.error("Auth Middleware Error", e);
    }
  }

  logger.warn(`Failed auth attempt from ${req.ip}`);
  return res.status(403).json({ error: 'Invalid Credentials' });
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
