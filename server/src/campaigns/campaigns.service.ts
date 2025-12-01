import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Campaign } from '../models';
import { Op } from 'sequelize';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign)
    private campaignModel: typeof Campaign,
  ) {}

  async findAll(filters?: { status?: string; actor?: string }): Promise<Campaign[]> {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.actor) {
      // Assuming threatActor is a string, check if it contains the actor
      where.threatActor = { [Op.like]: `%${filters.actor}%` };
    }
    return this.campaignModel.findAll({ where });
  }

  async findOne(id: string): Promise<Campaign | null> {
    return this.campaignModel.findByPk(id);
  }

  async create(createCampaignDto: any): Promise<Campaign> {
    if (!createCampaignDto.id) {
      createCampaignDto.id = `camp-${Date.now()}`;
    }
    return this.campaignModel.create(createCampaignDto);
  }

  async update(id: string, updateCampaignDto: any): Promise<Campaign | null> {
    const [affectedCount] = await this.campaignModel.update(updateCampaignDto, { where: { id } });
    if (affectedCount === 0) {
      return null;
    }
    return this.campaignModel.findByPk(id);
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.campaignModel.destroy({ where: { id } });
    return affectedCount > 0;
  }

  async getCampaignThreats(campaignId: string): Promise<any[]> {
    // This would need relationships defined in the model
    // For now, return empty array
    return [];
  }

  async getCampaignActors(campaignId: string): Promise<any[]> {
    // This would need relationships defined in the model
    // For now, return empty array
    return [];
  }

  async getCampaignStats(): Promise<any> {
    const total = await this.campaignModel.count();
    const active = await this.campaignModel.count({ where: { status: 'ACTIVE' } });
    // More stats can be added
    return { total, active };
  }
}