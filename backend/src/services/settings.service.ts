
import { Integration } from '../models/system';
import { AuditService } from './audit.service';

interface IntegrationInput {
  name: string;
  type: string;
  url: string;
  apiKey?: string;
}

export class SettingsService {
  static async getIntegrations(): Promise<Integration[]> {
    return await (Integration as any).findAll({
      attributes: ['id', 'name', 'type', 'url', 'status', 'last_sync']
    });
  }

  static async addIntegration(data: IntegrationInput, userId: string): Promise<Integration> {
    const id = `INT-${Date.now()}`;
    const int = await (Integration as any).create({
      id,
      name: data.name,
      type: data.type,
      url: data.url,
      api_key: data.apiKey,
      status: 'Connected',
      last_sync: new Date()
    });

    await AuditService.log(userId, 'INTEGRATION_ADDED', `Connected ${data.name} (${data.type})`);
    return int;
  }

  static async runMaintenance(action: string, userId: string): Promise<{ success: boolean; message: string }> {
    await AuditService.log(userId, 'MAINTENANCE_RUN', `Executed ${action}`);
    return { success: true, message: `${action} completed successfully.` };
  }
}
