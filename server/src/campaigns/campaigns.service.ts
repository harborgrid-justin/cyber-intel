import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Campaign } from '../models';
import { Op } from 'sequelize';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign)
    private readonly campaignModel: typeof Campaign,
  ) {}

  async findAll(filters?: { status?: string; actor?: string }): Promise<Campaign[]> {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.actor) {
      // Search in the actors JSON array
      where.actors = { [Op.like]: `%${filters.actor}%` };
    }
    return this.campaignModel.findAll({
      where,
      order: [['lastSeen', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignModel.findByPk(id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return campaign;
  }

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const campaignData = { ...createCampaignDto };
    if (!campaignData.id) {
      campaignData.id = `camp-${Date.now()}`;
    }
    return this.campaignModel.create(campaignData as any);
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.campaignModel.findByPk(id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    await campaign.update(updateCampaignDto);
    return campaign;
  }

  async remove(id: string): Promise<{ message: string }> {
    const campaign = await this.campaignModel.findByPk(id);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    await this.campaignModel.destroy({ where: { id } });
    return { message: 'Campaign deleted successfully' };
  }

  async getCampaignThreats(campaignId: string): Promise<any[]> {
    const campaign = await this.campaignModel.findByPk(campaignId);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }
    // Return the threat IDs associated with this campaign
    // In a full implementation, this would join with the Threats table
    return campaign.threatIds || [];
  }

  async getCampaignActors(campaignId: string): Promise<any[]> {
    const campaign = await this.campaignModel.findByPk(campaignId);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }
    // Return the actor IDs associated with this campaign
    // In a full implementation, this would join with the Actors table
    return campaign.actors || [];
  }

  async getCampaignStats(): Promise<{ total: number; active: number }> {
    const total = await this.campaignModel.count();
    const active = await this.campaignModel.count({ where: { status: 'ACTIVE' } });
    return { total, active };
  }

  async findByObjective(objective: string): Promise<Campaign[]> {
    return this.campaignModel.findAll({
      where: { objective },
      order: [['lastSeen', 'DESC']],
    });
  }

  async findBySector(sector: string): Promise<Campaign[]> {
    // For JSON array columns, we need to use a literal query or filter in application
    const campaigns = await this.campaignModel.findAll({
      order: [['lastSeen', 'DESC']],
    });
    return campaigns.filter((campaign) =>
      campaign.targetSectors?.some((s: string) =>
        s.toLowerCase().includes(sector.toLowerCase())
      )
    );
  }
}
