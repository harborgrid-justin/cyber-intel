/**
 * Migration Runner
 * Manages database schema migrations
 */

import { sequelize } from '../../config/database';
import { logger } from '../../utils/logger';

// Import all migrations in order
import * as migration001 from './001_create_system_tables';
import * as migration002 from './002_create_intelligence_tables';
import * as migration003 from './003_create_infrastructure_tables';
import * as migration004 from './004_create_operations_tables';
import * as migration005 from './005_create_integration_tables';

interface Migration {
  id: string;
  name: string;
  up: (queryInterface: any) => Promise<void>;
  down: (queryInterface: any) => Promise<void>;
}

// Migration registry
const migrations: Migration[] = [
  {
    id: '001',
    name: 'create_system_tables',
    up: migration001.up,
    down: migration001.down
  },
  {
    id: '002',
    name: 'create_intelligence_tables',
    up: migration002.up,
    down: migration002.down
  },
  {
    id: '003',
    name: 'create_infrastructure_tables',
    up: migration003.up,
    down: migration003.down
  },
  {
    id: '004',
    name: 'create_operations_tables',
    up: migration004.up,
    down: migration004.down
  },
  {
    id: '005',
    name: 'create_integration_tables',
    up: migration005.up,
    down: migration005.down
  }
];

/**
 * Create migrations tracking table
 */
async function createMigrationsTable(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();

  const tableExists = await queryInterface.showAllTables()
    .then(tables => tables.includes('migrations'));

  if (!tableExists) {
    await queryInterface.createTable('migrations', {
      id: {
        type: 'VARCHAR(255)',
        primaryKey: true
      },
      name: {
        type: 'VARCHAR(255)',
        allowNull: false
      },
      executed_at: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    logger.info('✓ Migrations tracking table created');
  }
}

/**
 * Get executed migrations
 */
async function getExecutedMigrations(): Promise<string[]> {
  const [results] = await sequelize.query(
    'SELECT id FROM migrations ORDER BY id ASC'
  );

  return (results as any[]).map(row => row.id);
}

/**
 * Record migration execution
 */
async function recordMigration(id: string, name: string): Promise<void> {
  await sequelize.query(
    'INSERT INTO migrations (id, name, executed_at) VALUES (?, ?, NOW())',
    { replacements: [id, name] }
  );
}

/**
 * Remove migration record
 */
async function removeMigrationRecord(id: string): Promise<void> {
  await sequelize.query(
    'DELETE FROM migrations WHERE id = ?',
    { replacements: [id] }
  );
}

/**
 * Run pending migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');

    const queryInterface = sequelize.getQueryInterface();

    // Create migrations tracking table
    await createMigrationsTable();

    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    logger.info(`Found ${executedMigrations.length} executed migrations`);

    // Find pending migrations
    const pendingMigrations = migrations.filter(
      migration => !executedMigrations.includes(migration.id)
    );

    if (pendingMigrations.length === 0) {
      logger.info('✓ No pending migrations');
      return;
    }

    logger.info(`Running ${pendingMigrations.length} pending migrations...`);

    // Execute pending migrations
    for (const migration of pendingMigrations) {
      logger.info(`→ Running migration ${migration.id}: ${migration.name}`);

      try {
        await migration.up(queryInterface);
        await recordMigration(migration.id, migration.name);
        logger.info(`✓ Migration ${migration.id} completed successfully`);
      } catch (error) {
        logger.error(`✗ Migration ${migration.id} failed:`, error);
        throw error;
      }
    }

    logger.info('✓ All migrations completed successfully');
  } catch (error) {
    logger.error('✗ Migration process failed:', error);
    throw error;
  }
}

/**
 * Rollback last migration
 */
export async function rollbackMigration(): Promise<void> {
  try {
    logger.info('Rolling back last migration...');

    const queryInterface = sequelize.getQueryInterface();

    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();

    if (executedMigrations.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    // Get last migration
    const lastMigrationId = executedMigrations[executedMigrations.length - 1];
    const migration = migrations.find(m => m.id === lastMigrationId);

    if (!migration) {
      throw new Error(`Migration ${lastMigrationId} not found`);
    }

    logger.info(`→ Rolling back migration ${migration.id}: ${migration.name}`);

    // Execute rollback
    await migration.down(queryInterface);
    await removeMigrationRecord(migration.id);

    logger.info(`✓ Migration ${migration.id} rolled back successfully`);
  } catch (error) {
    logger.error('✗ Rollback failed:', error);
    throw error;
  }
}

/**
 * Rollback all migrations
 */
export async function rollbackAllMigrations(): Promise<void> {
  try {
    logger.warn('⚠ Rolling back ALL migrations - all data will be lost!');

    const queryInterface = sequelize.getQueryInterface();

    // Get executed migrations in reverse order
    const executedMigrations = await getExecutedMigrations();
    const reversedMigrations = [...executedMigrations].reverse();

    if (reversedMigrations.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    logger.info(`Rolling back ${reversedMigrations.length} migrations...`);

    // Rollback each migration
    for (const migrationId of reversedMigrations) {
      const migration = migrations.find(m => m.id === migrationId);

      if (!migration) {
        logger.warn(`Migration ${migrationId} not found, skipping...`);
        continue;
      }

      logger.info(`→ Rolling back migration ${migration.id}: ${migration.name}`);

      try {
        await migration.down(queryInterface);
        await removeMigrationRecord(migration.id);
        logger.info(`✓ Migration ${migration.id} rolled back`);
      } catch (error) {
        logger.error(`✗ Rollback of migration ${migration.id} failed:`, error);
        throw error;
      }
    }

    logger.info('✓ All migrations rolled back successfully');
  } catch (error) {
    logger.error('✗ Rollback process failed:', error);
    throw error;
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus(): Promise<{
  executed: string[];
  pending: string[];
}> {
  await createMigrationsTable();

  const executedMigrations = await getExecutedMigrations();
  const pendingMigrations = migrations
    .filter(m => !executedMigrations.includes(m.id))
    .map(m => m.id);

  return {
    executed: executedMigrations,
    pending: pendingMigrations
  };
}
