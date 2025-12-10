
import { AuditLog } from '../models/operations';
import { logger } from '../utils/logger';
import { ModelStatic } from 'sequelize';

const AuditModel = AuditLog as ModelStatic<AuditLog>;

export class AuditService {
  static async log(
    user: string,
    action: string,
    details: string,
    resourceId?: string,
    ip?: string
  ): Promise<void> {
    try {
      await AuditModel.create({
        id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: user,
        action,
        details,
        resource_id: resourceId || '', // Ensure not null/undefined for strict types if schema allows empty string
        ip_address: ip || '127.0.0.1',
        timestamp: new Date()
      } as AuditLog);
    } catch (err) {
      logger.error('FAILED TO WRITE AUDIT LOG', { error: err, user, action });
    }
  }

  static async getLogs(limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    return await AuditModel.findAll({
      limit,
      offset,
      order: [['timestamp', 'DESC']]
    });
  }
}
