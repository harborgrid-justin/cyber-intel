
import { Role, Permission, User, Organization } from '../../models/system';
import { logger } from '../../utils/logger';

/**
 * Permission Cache Entry
 */
interface CacheEntry {
  permissions: Set<string>;
  timestamp: number;
}

/**
 * Resource-Level Permission Check Result
 */
interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
  matchedPermission?: string;
}

/**
 * Enhanced RBAC Engine with Caching and Resource-Level Permissions
 * Implements NIST 800-162 Attribute-Based Access Control principles
 */
export class RbacEngine {

  // Permission cache with TTL (Time To Live)
  private static permissionCache = new Map<string, CacheEntry>();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static CACHE_CLEANUP_INTERVAL = 60 * 1000; // 1 minute

  // Start cache cleanup interval
  static {
    setInterval(() => this.cleanupCache(), this.CACHE_CLEANUP_INTERVAL);
  }

  /**
   * Cleanup expired cache entries
   */
  private static cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.permissionCache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.permissionCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`[RBAC] Cleaned ${cleaned} expired cache entries`);
    }
  }

  /**
   * Invalidate cache for a specific user
   */
  static invalidateUserCache(userId: string): void {
    this.permissionCache.delete(userId);
    logger.debug(`[RBAC] Cache invalidated for user ${userId}`);
  }

  /**
   * Invalidate all cache entries
   */
  static invalidateAllCache(): void {
    this.permissionCache.clear();
    logger.debug('[RBAC] All cache entries invalidated');
  }

  /**
   * Calculates the full set of permissions for a user, traversing the role hierarchy.
   * NIST 800-162: Attribute Based Access Control - Policy Decision Point logic.
   * Now with caching support.
   */
  static async getEffectivePermissions(userId: string, useCache: boolean = true): Promise<Set<string>> {
    // Check cache first
    if (useCache) {
      const cached = this.permissionCache.get(userId);
      if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
        logger.debug(`[RBAC] Cache hit for user ${userId}`);
        return new Set(cached.permissions);
      }
    }

    const user = await (User as any).findByPk(userId, { include: [Role] });
    if (!user || !user.role_id) {
      logger.warn(`[RBAC] User ${userId} not found or has no role`);
      return new Set();
    }

    const permissions = new Set<string>();
    const visitedRoles = new Set<string>(); // Prevent circular references

    // Recursive function to traverse role hierarchy (RBAC-h)
    const traverseRole = async (roleId: string, depth: number = 0) => {
      // Prevent infinite loops
      if (visitedRoles.has(roleId)) {
        logger.warn(`[RBAC] Circular role reference detected: ${roleId}`);
        return;
      }

      // Limit recursion depth
      if (depth > 10) {
        logger.warn(`[RBAC] Maximum role hierarchy depth exceeded for role ${roleId}`);
        return;
      }

      visitedRoles.add(roleId);

      const role = await (Role as any).findByPk(roleId, {
        include: [Permission]
      });

      if (!role) {
        logger.warn(`[RBAC] Role ${roleId} not found`);
        return;
      }

      // Add direct permissions
      role.permissions.forEach((p: Permission) => {
        const permString = `${p.resource}:${p.action}`;
        permissions.add(permString);
      });

      // Recurse to parent role (Permission Inheritance)
      if (role.parent_role_id) {
        await traverseRole(role.parent_role_id, depth + 1);
      }
    };

    await traverseRole(user.role_id);

    // Cache the result
    this.permissionCache.set(userId, {
      permissions,
      timestamp: Date.now()
    });

    logger.debug(`[RBAC] Computed ${permissions.size} permissions for user ${userId}`);
    return permissions;
  }

  /**
   * Check if user has a specific permission
   * Supports wildcard matching and resource-level permissions
   */
  static async checkPermission(
    userId: string,
    resource: string,
    action: string,
    resourceId?: string
  ): Promise<PermissionCheckResult> {
    const permissions = await this.getEffectivePermissions(userId);
    const requiredPerm = `${resource}:${action}`;

    // Check for super admin permission
    if (permissions.has('*:*')) {
      return {
        granted: true,
        reason: 'Super admin access',
        matchedPermission: '*:*'
      };
    }

    // Check for exact permission match
    if (permissions.has(requiredPerm)) {
      return {
        granted: true,
        reason: 'Direct permission match',
        matchedPermission: requiredPerm
      };
    }

    // Check for resource wildcard (resource:*)
    const resourceWildcard = `${resource}:*`;
    if (permissions.has(resourceWildcard)) {
      return {
        granted: true,
        reason: 'Resource wildcard match',
        matchedPermission: resourceWildcard
      };
    }

    // Check for action wildcard (*:action)
    const actionWildcard = `*:${action}`;
    if (permissions.has(actionWildcard)) {
      return {
        granted: true,
        reason: 'Action wildcard match',
        matchedPermission: actionWildcard
      };
    }

    // Check for resource-specific permissions (e.g., case:read:CASE-123)
    if (resourceId) {
      const resourceSpecific = `${resource}:${action}:${resourceId}`;
      if (permissions.has(resourceSpecific)) {
        return {
          granted: true,
          reason: 'Resource-specific permission',
          matchedPermission: resourceSpecific
        };
      }
    }

    return {
      granted: false,
      reason: `Missing permission: ${requiredPerm}`
    };
  }

  /**
   * Check if user has any of the specified permissions
   */
  static async checkAnyPermission(
    userId: string,
    requiredPermissions: Array<{ resource: string; action: string }>
  ): Promise<PermissionCheckResult> {
    for (const perm of requiredPermissions) {
      const result = await this.checkPermission(userId, perm.resource, perm.action);
      if (result.granted) {
        return result;
      }
    }

    return {
      granted: false,
      reason: 'None of the required permissions matched'
    };
  }

  /**
   * Check if user has all of the specified permissions
   */
  static async checkAllPermissions(
    userId: string,
    requiredPermissions: Array<{ resource: string; action: string }>
  ): Promise<PermissionCheckResult> {
    for (const perm of requiredPermissions) {
      const result = await this.checkPermission(userId, perm.resource, perm.action);
      if (!result.granted) {
        return result;
      }
    }

    return {
      granted: true,
      reason: 'All required permissions matched'
    };
  }

  /**
   * Get role hierarchy for a user
   */
  static async getRoleHierarchy(userId: string): Promise<Role[]> {
    const user = await (User as any).findByPk(userId, { include: [Role] });
    if (!user || !user.role_id) return [];

    const roles: Role[] = [];
    const visitedRoles = new Set<string>();

    const traverseRole = async (roleId: string) => {
      if (visitedRoles.has(roleId)) return;
      visitedRoles.add(roleId);

      const role = await (Role as any).findByPk(roleId);
      if (!role) return;

      roles.push(role);

      if (role.parent_role_id) {
        await traverseRole(role.parent_role_id);
      }
    };

    await traverseRole(user.role_id);
    return roles;
  }

  /**
   * Syncs internal Role assignment based on Active Directory Group Membership.
   * Simulates LDAP query logic.
   */
  static async syncWithActiveDirectory(user: User, adGroups: string[]) {
    // Find highest priority role matching AD groups
    const mappedRoles = await (Role as any).findAll({
      where: { ad_group_mapping: adGroups }
    });

    if (mappedRoles.length > 0) {
      // Logic to pick most privileged role would go here.
      // For now, take the first match.
      if (user.role_id !== mappedRoles[0].id) {
        user.role_id = mappedRoles[0].id;
        await (user as any).save();

        // Invalidate cache for this user
        this.invalidateUserCache(user.id);

        logger.info(`[RBAC] Synced user ${user.username} to role ${mappedRoles[0].name} via AD Group`);
      }
    }
  }

  /**
   * Verifies if a user has access to a specific scope/organization.
   * Implements hierarchical organization access control.
   */
  static async validateOrgScope(user: User, targetOrgId: string): Promise<boolean> {
    if (!user.organization_id) return false;
    if (user.organization_id === targetOrgId) return true;

    // Check hierarchy path
    const userOrg = await (Organization as any).findByPk(user.organization_id);
    const targetOrg = await (Organization as any).findByPk(targetOrgId);

    if (userOrg && targetOrg) {
      // Allow if User Org is an ancestor of Target Org
      return targetOrg.path.startsWith(userOrg.path);
    }
    return false;
  }

  /**
   * Grant temporary permission to a user (for delegation scenarios)
   * These permissions are stored in cache only and expire with cache TTL
   */
  static async grantTemporaryPermission(
    userId: string,
    resource: string,
    action: string,
    expiresInMs?: number
  ): Promise<void> {
    const permissions = await this.getEffectivePermissions(userId);
    const newPerm = `${resource}:${action}`;
    permissions.add(newPerm);

    this.permissionCache.set(userId, {
      permissions,
      timestamp: Date.now()
    });

    logger.info(`[RBAC] Granted temporary permission ${newPerm} to user ${userId}`);
  }

  /**
   * Get permission summary for a user
   */
  static async getPermissionSummary(userId: string): Promise<{
    userId: string;
    roleHierarchy: string[];
    permissions: string[];
    permissionCount: number;
    cached: boolean;
  }> {
    const roles = await this.getRoleHierarchy(userId);
    const permissions = await this.getEffectivePermissions(userId);
    const cached = this.permissionCache.has(userId);

    return {
      userId,
      roleHierarchy: roles.map(r => r.name),
      permissions: Array.from(permissions).sort(),
      permissionCount: permissions.size,
      cached
    };
  }
}
