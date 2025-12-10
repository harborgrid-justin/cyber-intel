
import { sequelize } from '../config/database';
import { logger } from '../utils/logger';
import { Threat, Case, Actor } from '../models/intelligence';
import { Asset, Feed, Vendor } from '../models/infrastructure';
import { Playbook } from '../models/operations';
import { User, Role, Permission, RolePermission } from '../models/system';
import { 
  INITIAL_USERS, INITIAL_FEEDS, INITIAL_PLAYBOOKS, INITIAL_VENDORS, 
  INITIAL_THREATS, INITIAL_CASES, INITIAL_ACTORS, INITIAL_ASSETS,
  INITIAL_ROLES, INITIAL_PERMISSIONS, INITIAL_ROLE_PERMISSIONS 
} from '../db/mockData';

export class SeederService {
  
  static async seedAll(force = false) {
    if (force) {
      logger.warn('⚠️ Force seed enabled: Dropping tables...');
      await sequelize.sync({ force: true });
    }

    // Check if seeding is needed (idempotency check)
    const userCount = await (User as any).count();
    if (userCount > 0 && !force) {
      logger.info('Database already populated. Skipping seed.');
      return;
    }

    logger.info('🌱 Seeding Database...');

    // RBAC
    await (Permission as any).bulkCreate(INITIAL_PERMISSIONS, { ignoreDuplicates: true });
    await (Role as any).bulkCreate(INITIAL_ROLES, { ignoreDuplicates: true });
    await (RolePermission as any).bulkCreate(INITIAL_ROLE_PERMISSIONS, { ignoreDuplicates: true });

    // System
    await (User as any).bulkCreate(INITIAL_USERS, { ignoreDuplicates: true });

    // Intelligence
    await (Actor as any).bulkCreate(INITIAL_ACTORS, { ignoreDuplicates: true });
    await (Threat as any).bulkCreate(INITIAL_THREATS, { ignoreDuplicates: true });
    await (Case as any).bulkCreate(INITIAL_CASES, { ignoreDuplicates: true });

    // Infrastructure & Ops
    await (Asset as any).bulkCreate(INITIAL_ASSETS, { ignoreDuplicates: true });
    await (Feed as any).bulkCreate(INITIAL_FEEDS, { ignoreDuplicates: true });
    await (Playbook as any).bulkCreate(INITIAL_PLAYBOOKS, { ignoreDuplicates: true });
    await (Vendor as any).bulkCreate(INITIAL_VENDORS, { ignoreDuplicates: true });

    logger.info('✅ Database Seeded Successfully.');
  }
}
