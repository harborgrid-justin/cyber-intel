
import { Sequelize, Transaction, Op } from 'sequelize-typescript';
import { config } from './config';
import { Threat, Case, Actor, Campaign } from '../models/intelligence';
import { Asset, Vulnerability, Feed, Vendor } from '../models/infrastructure';
import { AuditLog, Report, Playbook, Artifact, ChainEvent } from '../models/operations';
import { User, Integration, Channel, Message, Role, Permission, RolePermission, Organization } from '../models/system';
import { logger } from '../utils/logger';

// ============================================
// Database Configuration with Connection Pooling
// ============================================

const dbConfig = {
  dialect: 'postgres' as const,
  logging: process.env.ENABLE_QUERY_LOGGING === 'true'
    ? (msg: string) => logger.debug(msg)
    : false,

  // Connection Pool Configuration
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    min: parseInt(process.env.DB_POOL_MIN || '5', 10),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
    idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
  },

  // Model Registration
  models: [
    // Intelligence Models
    Threat, Case, Actor, Campaign,
    // Infrastructure Models
    Asset, Vulnerability, Feed, Vendor,
    // Operations Models
    AuditLog, Report, Playbook, Artifact, ChainEvent,
    // System Models
    User, Role, Permission, RolePermission, Organization,
    Integration, Channel, Message
  ],

  // SSL Configuration for Production
  dialectOptions: config.env === 'production' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},

  // Query Retry Configuration
  retry: {
    max: 3,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /EHOSTUNREACH/
    ]
  },

  // Query Benchmark
  benchmark: config.env === 'development',

  // Define Defaults
  define: {
    underscored: false,
    freezeTableName: true,
    charset: 'utf8mb4',
    dialectOptions: {
      collate: 'utf8mb4_unicode_ci'
    }
  }
};

// Initialize Sequelize Instance
export const sequelize = new Sequelize(
  config.dbUrl || 'postgresql://sentinel_user:sentinel_secure_pass@localhost:5432/sentinel_core',
  dbConfig
);

// ============================================
// Connection Management with Retry Logic
// ============================================

let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Establish database connection with retry logic
 */
export async function connectDatabase(): Promise<void> {
  while (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
    try {
      connectionAttempts++;
      logger.info(`Attempting database connection (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})...`);

      await sequelize.authenticate();
      logger.info('✓ Database connection established successfully');

      // Sync models in development (use migrations in production)
      if (config.env === 'development') {
        logger.info('Syncing database models...');
        await sequelize.sync({ alter: false });
        logger.info('✓ Database models synchronized');
      }

      connectionAttempts = 0; // Reset on success
      return;

    } catch (error) {
      logger.error(`✗ Database connection failed (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`, error);

      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        logger.error('Max connection attempts reached. Unable to connect to database.');
        throw new Error('Database connection failed after maximum retry attempts');
      }

      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

/**
 * Gracefully close database connection
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await sequelize.close();
    logger.info('✓ Database connection closed gracefully');
  } catch (error) {
    logger.error('✗ Error closing database connection:', error);
    throw error;
  }
}

// ============================================
// Transaction Support Helpers
// ============================================

/**
 * Execute a function within a database transaction
 * @param callback Function to execute within transaction
 * @returns Result of the callback
 */
export async function withTransaction<T>(
  callback: (transaction: Transaction) => Promise<T>
): Promise<T> {
  const transaction = await sequelize.transaction();

  try {
    const result = await callback(transaction);
    await transaction.commit();
    logger.debug('Transaction committed successfully');
    return result;
  } catch (error) {
    await transaction.rollback();
    logger.error('Transaction rolled back due to error:', error);
    throw error;
  }
}

/**
 * Execute multiple operations in a managed transaction
 * @param operations Array of operations to execute
 * @returns Array of results
 */
export async function executeInTransaction<T>(
  operations: ((t: Transaction) => Promise<T>)[]
): Promise<T[]> {
  return withTransaction(async (transaction) => {
    return Promise.all(operations.map(op => op(transaction)));
  });
}

// ============================================
// Migration Support Utilities
// ============================================

/**
 * Check if a table exists in the database
 * @param tableName Name of the table to check
 * @returns True if table exists, false otherwise
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    return tables.includes(tableName);
  } catch (error) {
    logger.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Run database migrations
 * @param direction 'up' for applying migrations, 'down' for reverting
 */
export async function runMigrations(direction: 'up' | 'down' = 'up'): Promise<void> {
  try {
    logger.info(`Running migrations: ${direction}...`);

    if (direction === 'up') {
      // Apply all pending migrations
      await sequelize.sync({ alter: false });
      logger.info('✓ Migrations applied successfully');
    } else {
      // Revert migrations (drop all tables)
      await sequelize.drop();
      logger.info('✓ All tables dropped');
    }
  } catch (error) {
    logger.error(`✗ Migration error:`, error);
    throw error;
  }
}

/**
 * Reset database (drop all tables and recreate)
 */
export async function resetDatabase(): Promise<void> {
  try {
    logger.warn('⚠ Resetting database - all data will be lost!');
    await sequelize.drop();
    logger.info('✓ All tables dropped');

    await sequelize.sync({ force: true });
    logger.info('✓ Database schema recreated');
  } catch (error) {
    logger.error('✗ Database reset error:', error);
    throw error;
  }
}

// ============================================
// Health Check Utilities
// ============================================

/**
 * Check database health status
 * @returns Health check result
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    await sequelize.authenticate();
    const latency = Date.now() - startTime;

    return {
      status: 'healthy',
      latency
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get connection pool statistics
 */
export function getPoolStats() {
  const pool = sequelize.connectionManager.pool;

  return {
    total: pool?.size || 0,
    idle: pool?.available || 0,
    active: pool?.using || 0,
    waiting: pool?.waiting || 0
  };
}

// ============================================
// Legacy Query Support
// ============================================

/**
 * Execute raw SQL query (use sparingly - prefer ORM methods)
 * @param text SQL query string
 * @param params Query parameters
 * @returns Query results
 */
export async function query(text: string, params?: any[]) {
  try {
    return await sequelize.query(text, {
      replacements: params,
      logging: (sql) => logger.debug('Raw SQL:', sql)
    });
  } catch (error) {
    logger.error('Raw query error:', error);
    throw error;
  }
}

// ============================================
// Bulk Operations Helpers
// ============================================

/**
 * Bulk insert with transaction support
 * @param model Sequelize model
 * @param records Array of records to insert
 * @param options Bulk create options
 */
export async function bulkInsert<T>(
  model: any,
  records: any[],
  options?: any
): Promise<T[]> {
  return withTransaction(async (transaction) => {
    return model.bulkCreate(records, {
      transaction,
      validate: true,
      ...options
    });
  });
}

/**
 * Bulk update with transaction support
 * @param model Sequelize model
 * @param updates Update values
 * @param where Where clause
 */
export async function bulkUpdate(
  model: any,
  updates: any,
  where: any
): Promise<number> {
  return withTransaction(async (transaction) => {
    const [affectedCount] = await model.update(updates, {
      where,
      transaction
    });
    return affectedCount;
  });
}

/**
 * Bulk delete with transaction support
 * @param model Sequelize model
 * @param where Where clause
 */
export async function bulkDelete(
  model: any,
  where: any
): Promise<number> {
  return withTransaction(async (transaction) => {
    return model.destroy({
      where,
      transaction
    });
  });
}

// ============================================
// Export Operators for Query Building
// ============================================

export { Op, Transaction };

// ============================================
// Graceful Shutdown Handler
// ============================================

process.on('SIGINT', async () => {
  logger.info('Received SIGINT signal. Closing database connection...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM signal. Closing database connection...');
  await disconnectDatabase();
  process.exit(0);
});
