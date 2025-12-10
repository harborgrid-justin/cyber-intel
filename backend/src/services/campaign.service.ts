
import { Campaign } from '../models/intelligence';
import { AuditService } from './audit.service';

export class CampaignService {
  static async getAll() {
    return await (Campaign as any).findAll({ order: [['last_seen', 'DESC']] });
  }

  static async create(data: any, userId: string) {
    const id = `CAM-${Date.now()}`;
    const campaign = await (Campaign as any).create({
      id,
      name: data.name,
      description: data.description || '',
      status: data.status || 'ACTIVE',
      objective: data.objective || 'UNKNOWN',
      actors: data.actors || [],
      target_sectors: data.targetSectors || [],
      target_regions: data.targetRegions || [],
      threat_ids: data.threatIds || [],
      ttps: data.ttps || [],
      first_seen: new Date(),
      last_seen: new Date()
    });

    await AuditService.log(userId, 'CAMPAIGN_INIT', `Initialized campaign ${data.name}`, id);
    return campaign;
  }
}
