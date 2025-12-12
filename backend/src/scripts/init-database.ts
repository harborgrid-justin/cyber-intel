/**
 * Database Initialization Script
 * Sets up database, runs migrations, and loads seed data
 */

import { connectDatabase, runMigrations, sequelize } from '../config/database';
import { logger } from '../utils/logger';
import { runSeeds } from './seed';

async function initializeDatabase() {
  try {
    logger.info('========================================');
    logger.info('SENTINEL Database Initialization');
    logger.info('========================================');

    // Step 1: Connect to database
    logger.info('\n[1/3] Connecting to database...');
    await connectDatabase();

    // Step 2: Run migrations
    logger.info('\n[2/3] Running database migrations...');
    await sequelize.sync({ force: false, alter: false });
    logger.info('✓ Database schema created successfully');

    // Step 3: Load seed data
    logger.info('\n[3/3] Loading seed data...');
    await runSeeds();

    logger.info('\n========================================');
    logger.info('✓ Database initialization complete!');
    logger.info('========================================');
    logger.info('\nDatabase ready for use.');
    logger.info('Default credentials: admin.connor / Sentinel@2024!');
    logger.info('\nAccess points:');
    logger.info('- Database: postgresql://localhost:5432/sentinel_core');
    logger.info('- pgAdmin: http://localhost:5050');
    logger.info('- Redis: localhost:6379');
    logger.info('========================================\n');

    process.exit(0);
  } catch (error) {
    logger.error('\n✗ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
