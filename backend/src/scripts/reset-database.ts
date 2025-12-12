/**
 * Database Reset Script
 * WARNING: This will drop all tables and data!
 * Use only in development environments
 */

import { connectDatabase, resetDatabase, sequelize } from '../config/database';
import { logger } from '../utils/logger';
import { runSeeds } from './seed';
import * as readline from 'readline';

async function confirmReset(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will DELETE ALL DATA in the database!\n' +
      'Are you sure you want to continue? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

async function resetDatabaseWithConfirmation() {
  try {
    logger.warn('========================================');
    logger.warn('SENTINEL Database Reset');
    logger.warn('========================================');

    // Confirm in production-like environments
    if (process.env.NODE_ENV !== 'development') {
      logger.error('✗ Database reset is only allowed in development environment!');
      process.exit(1);
    }

    const confirmed = await confirmReset();
    if (!confirmed) {
      logger.info('Database reset cancelled.');
      process.exit(0);
    }

    // Step 1: Connect to database
    logger.info('\n[1/4] Connecting to database...');
    await connectDatabase();

    // Step 2: Drop all tables
    logger.warn('\n[2/4] Dropping all tables...');
    await resetDatabase();

    // Step 3: Recreate schema
    logger.info('\n[3/4] Recreating database schema...');
    await sequelize.sync({ force: true });

    // Step 4: Load seed data
    logger.info('\n[4/4] Loading fresh seed data...');
    await runSeeds();

    logger.info('\n========================================');
    logger.info('✓ Database reset complete!');
    logger.info('========================================\n');

    process.exit(0);
  } catch (error) {
    logger.error('\n✗ Database reset failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  resetDatabaseWithConfirmation();
}

export { resetDatabaseWithConfirmation };
