import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Campaign } from '@/types';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  async findAll(@Query('status') status?: string, @Query('actor') actor?: string): Promise<Campaign[]> {
    try {
      return await this.campaignsService.findAll({ status, actor });
    } catch (error) {
      throw new HttpException('Failed to retrieve campaigns', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Campaign> {
    try {
      const campaign = await this.campaignsService.findOne(id);
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return campaign;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createCampaignDto: Omit<Campaign, 'id'>): Promise<Campaign> {
    try {
      return await this.campaignsService.create(createCampaignDto);
    } catch (error) {
      throw new HttpException('Failed to create campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCampaignDto: Partial<Campaign>): Promise<Campaign> {
    try {
      const campaign = await this.campaignsService.update(id, updateCampaignDto);
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return campaign;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.campaignsService.remove(id);
      if (!result) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Campaign deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/threats')
  async getCampaignThreats(@Param('id') id: string): Promise<any[]> {
    try {
      return await this.campaignsService.getCampaignThreats(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve campaign threats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/actors')
  async getCampaignActors(@Param('id') id: string): Promise<any[]> {
    try {
      return await this.campaignsService.getCampaignActors(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve campaign actors', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}