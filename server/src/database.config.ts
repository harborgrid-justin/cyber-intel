import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Threat, Case, Evidence, Detection, Feed, Incident, Campaign, Vulnerability, Actor, ForensicJob, ParserRule, EnrichmentModule, NormalizationRule, SystemNode, User } from './models';

export const databaseConfig: SequelizeModuleOptions = {
  dialect: 'sqlite',
  host: process.env.DB_HOST || ':memory:',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'cyber_intel',
  models: [Threat, Case, Evidence, Detection, Feed, Incident, Campaign, Vulnerability, Actor, ForensicJob, ParserRule, EnrichmentModule, NormalizationRule, SystemNode, User],
  autoLoadModels: false,
  synchronize: true, // For development; disable in production
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
};