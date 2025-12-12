/**
 * Comprehensive Database Seeding Script
 * Loads all seed data for SENTINEL platform
 */

import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

// Import models
import { Threat, Case, Actor, Campaign } from '../models/intelligence';
import { Asset, Vulnerability, Feed, Vendor } from '../models/infrastructure';
import { AuditLog, Report, Playbook, Artifact, ChainEvent } from '../models/operations';
import { User, Integration, Channel, Message, Role, Permission, RolePermission, Organization } from '../models/system';

// Import seed data
import {INITIAL_ORGANIZATIONS, INITIAL_PERMISSIONS, INITIAL_ROLES, INITIAL_ROLE_PERMISSIONS, INITIAL_USERS } from '../db/seeds/system.seed';
import { INITIAL_THREATS, INITIAL_CASES, INITIAL_ACTORS, INITIAL_CAMPAIGNS } from '../db/seeds/intelligence.seed';
import { INITIAL_ASSETS, INITIAL_VULNERABILITIES, INITIAL_FEEDS, INITIAL_VENDORS } from '../db/seeds/infrastructure.seed';
import { INITIAL_AUDIT_LOGS, INITIAL_REPORTS, INITIAL_PLAYBOOKS, INITIAL_ARTIFACTS, INITIAL_CHAIN_EVENTS } from '../db/seeds/operations.seed';
import { INITIAL_INTEGRATIONS, INITIAL_CHANNELS, INITIAL_MESSAGES } from '../db/seeds/communications.seed';

export async function runSeeds(force: boolean = false) {
  try {
    logger.info('Starting database seeding...');

    // Check if database already has data
    const threatCount = await Threat.count();
    if (threatCount > 0 && !force) {
      logger.warn('Database already contains data. Use force=true to reseed.');
      return;
    }

    // Seed in dependency order

    // 1. System - Organizations
    logger.info('→ Seeding organizations...');
    await Organization.bulkCreate(INITIAL_ORGANIZATIONS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_ORGANIZATIONS.length} organizations`);

    // 2. System - Permissions
    logger.info('→ Seeding permissions...');
    await Permission.bulkCreate(INITIAL_PERMISSIONS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_PERMISSIONS.length} permissions`);

    // 3. System - Roles
    logger.info('→ Seeding roles...');
    await Role.bulkCreate(INITIAL_ROLES as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_ROLES.length} roles`);

    // 4. System - Role Permissions
    logger.info('→ Seeding role permissions...');
    await RolePermission.bulkCreate(INITIAL_ROLE_PERMISSIONS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_ROLE_PERMISSIONS.length} role-permission mappings`);

    // 5. System - Users
    logger.info('→ Seeding users...');
    await User.bulkCreate(INITIAL_USERS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_USERS.length} users`);

    // 6. Intelligence - Threats
    logger.info('→ Seeding threats...');
    await Threat.bulkCreate(INITIAL_THREATS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_THREATS.length} threats`);

    // 7. Intelligence - Actors
    logger.info('→ Seeding threat actors...');
    await Actor.bulkCreate(INITIAL_ACTORS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_ACTORS.length} threat actors`);

    // 8. Intelligence - Campaigns
    logger.info('→ Seeding campaigns...');
    await Campaign.bulkCreate(INITIAL_CAMPAIGNS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_CAMPAIGNS.length} campaigns`);

    // 9. Intelligence - Cases
    logger.info('→ Seeding cases...');
    await Case.bulkCreate(INITIAL_CASES as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_CASES.length} cases`);

    // 10. Infrastructure - Assets
    logger.info('→ Seeding assets...');
    await Asset.bulkCreate(INITIAL_ASSETS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_ASSETS.length} assets`);

    // 11. Infrastructure - Vulnerabilities
    logger.info('→ Seeding vulnerabilities...');
    await Vulnerability.bulkCreate(INITIAL_VULNERABILITIES as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_VULNERABILITIES.length} vulnerabilities`);

    // 12. Infrastructure - Feeds
    logger.info('→ Seeding threat feeds...');
    await Feed.bulkCreate(INITIAL_FEEDS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_FEEDS.length} feeds`);

    // 13. Infrastructure - Vendors
    logger.info('→ Seeding vendors...');
    await Vendor.bulkCreate(INITIAL_VENDORS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_VENDORS.length} vendors`);

    // 14. Operations - Audit Logs
    logger.info('→ Seeding audit logs...');
    await AuditLog.bulkCreate(INITIAL_AUDIT_LOGS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_AUDIT_LOGS.length} audit logs`);

    // 15. Operations - Reports
    logger.info('→ Seeding reports...');
    await Report.bulkCreate(INITIAL_REPORTS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_REPORTS.length} reports`);

    // 16. Operations - Playbooks
    logger.info('→ Seeding playbooks...');
    await Playbook.bulkCreate(INITIAL_PLAYBOOKS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_PLAYBOOKS.length} playbooks`);

    // 17. Operations - Artifacts
    logger.info('→ Seeding artifacts...');
    await Artifact.bulkCreate(INITIAL_ARTIFACTS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_ARTIFACTS.length} artifacts`);

    // 18. Operations - Chain of Custody Events
    logger.info('→ Seeding chain of custody events...');
    await ChainEvent.bulkCreate(INITIAL_CHAIN_EVENTS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_CHAIN_EVENTS.length} chain events`);

    // 19. Communications - Integrations
    logger.info('→ Seeding integrations...');
    await Integration.bulkCreate(INITIAL_INTEGRATIONS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_INTEGRATIONS.length} integrations`);

    // 20. Communications - Channels
    logger.info('→ Seeding channels...');
    await Channel.bulkCreate(INITIAL_CHANNELS as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_CHANNELS.length} channels`);

    // 21. Communications - Messages
    logger.info('→ Seeding messages...');
    await Message.bulkCreate(INITIAL_MESSAGES as any[], { ignoreDuplicates: true });
    logger.info(`  ✓ ${INITIAL_MESSAGES.length} messages`);

    logger.info('✓ Database seeding completed successfully!');

    // Summary
    logger.info('\n========================================');
    logger.info('Seed Data Summary:');
    logger.info('========================================');
    logger.info(`Organizations:     ${INITIAL_ORGANIZATIONS.length}`);
    logger.info(`Users:             ${INITIAL_USERS.length}`);
    logger.info(`Roles:             ${INITIAL_ROLES.length}`);
    logger.info(`Permissions:       ${INITIAL_PERMISSIONS.length}`);
    logger.info(`Threats:           ${INITIAL_THREATS.length}`);
    logger.info(`Cases:             ${INITIAL_CASES.length}`);
    logger.info(`Threat Actors:     ${INITIAL_ACTORS.length}`);
    logger.info(`Campaigns:         ${INITIAL_CAMPAIGNS.length}`);
    logger.info(`Assets:            ${INITIAL_ASSETS.length}`);
    logger.info(`Vulnerabilities:   ${INITIAL_VULNERABILITIES.length}`);
    logger.info(`Feeds:             ${INITIAL_FEEDS.length}`);
    logger.info(`Vendors:           ${INITIAL_VENDORS.length}`);
    logger.info(`Audit Logs:        ${INITIAL_AUDIT_LOGS.length}`);
    logger.info(`Reports:           ${INITIAL_REPORTS.length}`);
    logger.info(`Playbooks:         ${INITIAL_PLAYBOOKS.length}`);
    logger.info(`Artifacts:         ${INITIAL_ARTIFACTS.length}`);
    logger.info(`Chain Events:      ${INITIAL_CHAIN_EVENTS.length}`);
    logger.info(`Integrations:      ${INITIAL_INTEGRATIONS.length}`);
    logger.info(`Channels:          ${INITIAL_CHANNELS.length}`);
    logger.info(`Messages:          ${INITIAL_MESSAGES.length}`);
    logger.info('========================================\n');

  } catch (error) {
    logger.error('✗ Database seeding failed:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      await runSeeds(true);
      process.exit(0);
    } catch (error) {
      logger.error('Seed script failed:', error);
      process.exit(1);
    }
  })();
}
