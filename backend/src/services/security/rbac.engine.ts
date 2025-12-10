
import { Role, Permission, User, Organization } from '../../models/system';
import { logger } from '../../utils/logger';

export class RbacEngine {
  
  /**
   * Calculates the full set of permissions for a user, traversing the role hierarchy.
   * NIST 800-162: Attribute Based Access Control - Policy Decision Point logic.
   */
  static async getEffectivePermissions(userId: string): Promise<Set<string>> {
    const user = await (User as any).findByPk(userId, { include: [Role] });
    if (!user || !user.role_id) return new Set();

    const permissions = new Set<string>();
    
    // Recursive function to traverse role hierarchy (RBAC-h)
    const traverseRole = async (roleId: string) => {
      const role = await (Role as any).findByPk(roleId, {
        include: [Permission]
      });
      
      if (!role) return;

      // Add direct permissions
      role.permissions.forEach((p: Permission) => {
        permissions.add(`${p.resource}:${p.action}`);
      });

      // Recurse to parent role (Generalization)
      if (role.parent_role_id) {
        await traverseRole(role.parent_role_id);
      }
    };

    await traverseRole(user.role_id);
    return permissions;
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
        logger.info(`[RBAC] Synced user ${user.username} to role ${mappedRoles[0].name} via AD Group`);
      }
    }
  }

  /**
   * Verifies if a user has access to a specific scope/organization.
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
}
