
import { Campaign } from '../models/intelligence';
import { AuditService } from './audit.service';
import { ModelStatic } from 'sequelize';

const CampaignModel = Campaign as ModelStatic<Campaign>;

interface CreateCampaignInput {
  name: string;
  description?: string;
  status?: string;
  objective?: string;
  actors?: string[];
  targetSectors?: string[];
  targetRegions?: string[];
  threatIds?: string[];
  ttps?: string[];
}

interface UpdateCampaignInput extends Partial<CreateCampaignInput> {}

export class CampaignService {
  static async getAll() {
    return await CampaignModel.findAll({ order: [['last_seen', 'DESC']] });
  }

  static async getById(id: string): Promise<Campaign | null> {
    return await CampaignModel.findByPk(id);
  }

  static async create(data: CreateCampaignInput, userId: string) {
    const id = `CAM-${Date.now()}`;
    const campaign = await CampaignModel.create({
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
    } as Campaign);

    await AuditService.log(userId, 'CAMPAIGN_INIT', `Initialized campaign ${data.name}`, id);
    return campaign;
  }

  static async update(id: string, data: UpdateCampaignInput, userId: string): Promise<Campaign | null> {
    const campaign = await CampaignModel.findByPk(id);
    if (campaign) {
      if (data.name) campaign.name = data.name;
      if (data.description) campaign.description = data.description;
      if (data.status) campaign.status = data.status;
      if (data.objective) campaign.objective = data.objective;
      if (data.actors) campaign.actors = data.actors;
      if (data.targetSectors) campaign.target_sectors = data.targetSectors;
      if (data.targetRegions) campaign.target_regions = data.targetRegions;
      if (data.threatIds) campaign.threat_ids = data.threatIds;
      if (data.ttps) campaign.ttps = data.ttps;

      campaign.last_seen = new Date();
      await campaign.save();
      await AuditService.log(userId, 'CAMPAIGN_UPDATED', `Updated campaign ${id}`, id);
      return campaign;
    }
    return null;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const campaign = await CampaignModel.findByPk(id);
    if (campaign) {
      await campaign.destroy();
      await AuditService.log(userId, 'CAMPAIGN_DELETED', `Deleted campaign ${id}`, id);
      return true;
    }
    return false;
  }
}
