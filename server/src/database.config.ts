import 'dotenv/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';
import { Threat, Case, Evidence, Detection, Feed, Incident, Campaign, Vulnerability, Actor, ForensicJob, ParserRule, EnrichmentModule, NormalizationRule, SystemNode, User } from './models';

const dialect = (process.env.DB_DIALECT as Dialect) || 'postgres';

const synchronize = process.env.DB_SYNC
  ? process.env.DB_SYNC.toLowerCase() === 'true'
  : process.env.NODE_ENV !== 'production';

const logging = process.env.NODE_ENV === 'development' ? console.log : false;

export const databaseConfig: SequelizeModuleOptions = {
  dialect,
  models: [
    Threat,
    Case,
    Evidence,
    Detection,
    Feed,
    Incident,
    Campaign,
    Vulnerability,
    Actor,
    ForensicJob,
    ParserRule,
    EnrichmentModule,
    NormalizationRule,
    SystemNode,
    User,
  ],
  autoLoadModels: true,
  synchronize: true,
  logging,
};

if (dialect === 'sqlite') {
  databaseConfig.storage = process.env.DB_STORAGE || process.env.DB_NAME || 'cyber_intel.sqlite';
} else {
  databaseConfig.host = process.env.DB_HOST || 'localhost';
  databaseConfig.port = parseInt(process.env.DB_PORT ?? '5432', 10);
  databaseConfig.username = process.env.DB_USERNAME || 'postgres';
  databaseConfig.password = process.env.DB_PASSWORD || 'postgres';
  databaseConfig.database = process.env.DB_NAME || 'cyber_intel';

  if (process.env.DB_SSL === 'true') {
    databaseConfig.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      },
    };
  }
}