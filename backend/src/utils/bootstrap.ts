
import { Client } from 'pg';
import { config } from '../config/config';
import { logger } from './logger';
import { sequelize } from '../config/database';

export class BootstrapUtils {
  
  /**
   * Connects to the default 'postgres' db to create the target db if missing.
   */
  static async ensureDatabaseExists() {
    // Parse DB config from connection string or env vars
    // Assuming format: postgres://user:pass@host:port/dbname
    const dbName = config.dbUrl?.split('/').pop() || 'threat_intel_core';
    const connectionString = config.dbUrl?.replace(`/${dbName}`, '/postgres');

    const client = new Client({ connectionString });

    try {
      await client.connect();
      const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
      
      if (res.rowCount === 0) {
        logger.info(`Database '${dbName}' not found. Creating...`);
        await client.query(`CREATE DATABASE "${dbName}"`);
        logger.info(`Database '${dbName}' created successfully.`);
      } else {
        logger.info(`Database '${dbName}' exists.`);
      }
    } catch (err) {
      logger.error('Error checking/creating database:', err);
      // Don't throw, let Sequelize attempt connection and fail if critical
    } finally {
      await client.end();
    }
  }

  /**
   * Attempts to connect to Sequelize with exponential backoff.
   */
  static async waitForDatabase(retries = 5, delay = 2000): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      try {
        await sequelize.authenticate();
        logger.info('📦 Database connection established.');
        return true;
      } catch (err: any) {
        logger.warn(`Database connection failed (Attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
        logger.debug(err.message);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      }
    }
    logger.error('❌ Could not connect to database after multiple attempts.');
    return false;
  }
}
