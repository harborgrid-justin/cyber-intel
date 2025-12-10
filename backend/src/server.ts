import app from './app';
import { config } from './config/config';
import { logger } from './utils/logger';
import { sequelize } from './config/database';
import { BootstrapUtils } from './utils/bootstrap';
import { SeederService } from './services/seeder.service';

const startServer = async () => {
  try {
    logger.info('🚀 Initializing Synapse Core...');

    // 1. Ensure DB exists (Auto-create)
    await BootstrapUtils.ensureDatabaseExists();

    // 2. Wait for DB readiness (Retry logic)
    const isConnected = await BootstrapUtils.waitForDatabase();
    if (!isConnected) (process as any).exit(1);
    
    // 3. Sync Schema (Auto-migrate)
    logger.info('🔄 Syncing Database Schema...');
    await sequelize.sync({ alter: config.env === 'development' });

    // 4. Auto-Seed (if empty)
    await SeederService.seedAll(false);

    // 5. Start API
    const port = Number(config.port) || 4000;
    app.listen(port, '0.0.0.0', () => {
      logger.info(`🛡️  Synapse Backend Server running on port ${port}`);
      logger.info(`🔧 Environment: ${config.env}`);
    });

  } catch (error) {
    logger.error('❌ Fatal Error during startup:', error);
    (process as any).exit(1);
  }
};

startServer();