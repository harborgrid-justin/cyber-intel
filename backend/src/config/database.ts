
import { Sequelize } from 'sequelize-typescript';
import { config } from './config';
import { Threat, Case, Actor, Campaign } from '../models/intelligence';
import { Asset, Vulnerability, Feed, Vendor } from '../models/infrastructure';
import { AuditLog, Report, Playbook, Artifact, ChainEvent } from '../models/operations';
import { User, Integration, Channel, Message, Role, Permission, RolePermission, Organization } from '../models/system';
import { logger } from '../utils/logger';

export const sequelize = new Sequelize(config.dbUrl || 'postgres://user:pass@localhost:5432/db', {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  models: [
    Threat, Case, Actor, Campaign,
    Asset, Vulnerability, Feed, Vendor,
    AuditLog, Report, Playbook, Artifact, ChainEvent,
    User, Role, Permission, RolePermission, Organization, // Added RBAC models
    Integration, Channel, Message
  ],
  dialectOptions: config.env === 'production' ? {
    ssl: { require: true, rejectUnauthorized: false }
  } : {}
});

// Adapter for legacy query support during migration (optional, or removed if fully migrated)
export const query = async (text: string, params?: any[]) => {
  // Use sequelize.query for raw queries if absolutely necessary
  return await sequelize.query(text, { replacements: params });
};
