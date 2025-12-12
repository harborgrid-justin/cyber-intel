
import { sequelize } from '../config/database';
import { logger } from '../utils/logger';
import { Threat, Case, Actor } from '../models/intelligence';
import { Asset, Feed, Vendor } from '../models/infrastructure';
import { Playbook } from '../models/operations';
import { User, Role, Permission, RolePermission, Organization } from '../models/system';
import {
  INITIAL_USERS, INITIAL_FEEDS, INITIAL_PLAYBOOKS, INITIAL_VENDORS,
  INITIAL_THREATS, INITIAL_CASES, INITIAL_ACTORS, INITIAL_ASSETS,
  INITIAL_ROLES, INITIAL_PERMISSIONS, INITIAL_ROLE_PERMISSIONS,
  INITIAL_ORGANIZATIONS
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

    // Organizations (must be first due to foreign key constraints)
    logger.info('  📁 Seeding Organizations...');
    await (Organization as any).bulkCreate(INITIAL_ORGANIZATIONS, { ignoreDuplicates: true });

    // RBAC (Permissions → Roles → RolePermissions)
    logger.info('  🔐 Seeding Permissions...');
    await (Permission as any).bulkCreate(INITIAL_PERMISSIONS, { ignoreDuplicates: true });

    logger.info('  👥 Seeding Roles...');
    await (Role as any).bulkCreate(INITIAL_ROLES, { ignoreDuplicates: true });

    logger.info('  🔗 Mapping Role Permissions...');
    await (RolePermission as any).bulkCreate(INITIAL_ROLE_PERMISSIONS, { ignoreDuplicates: true });

    // System Users
    logger.info('  👤 Seeding Users...');
    await (User as any).bulkCreate(INITIAL_USERS, { ignoreDuplicates: true });

    // Intelligence Data
    logger.info('  🎭 Seeding Threat Actors...');
    await (Actor as any).bulkCreate(INITIAL_ACTORS, { ignoreDuplicates: true });

    logger.info('  ⚠️ Seeding Threats...');
    await (Threat as any).bulkCreate(INITIAL_THREATS, { ignoreDuplicates: true });

    logger.info('  📋 Seeding Cases...');
    await (Case as any).bulkCreate(INITIAL_CASES, { ignoreDuplicates: true });

    // Infrastructure & Operations
    logger.info('  💻 Seeding Assets...');
    await (Asset as any).bulkCreate(INITIAL_ASSETS, { ignoreDuplicates: true });

    logger.info('  📡 Seeding Feeds...');
    await (Feed as any).bulkCreate(INITIAL_FEEDS, { ignoreDuplicates: true });

    logger.info('  📖 Seeding Playbooks...');
    await (Playbook as any).bulkCreate(INITIAL_PLAYBOOKS, { ignoreDuplicates: true });

    logger.info('  🏢 Seeding Vendors...');
    await (Vendor as any).bulkCreate(INITIAL_VENDORS, { ignoreDuplicates: true });

    logger.info('✅ Database Seeded Successfully.');
    logger.info('');
    logger.info('📝 Demo User Credentials (Change in Production!):');
    logger.info('   Username: superadmin | Password: Sentinel@2024!');
    logger.info('   Username: admin.connor | Password: Sentinel@2024!');
    logger.info('   Username: analyst.doe | Password: Sentinel@2024!');
    logger.info('   (See system.seed.ts for all users)');
  }
}

/**
 * Exported function to run database seeds
 * @param force - Force reseed even if database is already populated
 */
export async function runSeeds(force = false): Promise<void> {
  return SeederService.seedAll(force);
}
