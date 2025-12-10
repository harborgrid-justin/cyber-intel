import { sequelize } from '../config/database';
import { logger } from '../utils/logger';
import { SeederService } from '../services/seeder.service';

const runSeed = async () => {
  try {
    logger.info('🌱 Starting Manual Database Seed...');
    
    // Connect first
    await sequelize.authenticate();
    
    // Force seed (re-creates tables)
    await SeederService.seedAll(true);

    logger.info('🚀 Manual Seeding Complete');
    (process as any).exit(0);
  } catch (err) {
    logger.error('❌ Seed Failed', err);
    (process as any).exit(1);
  }
};

runSeed();