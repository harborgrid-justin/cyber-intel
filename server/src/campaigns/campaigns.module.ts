import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { Campaign } from '../models';

@Module({
  imports: [SequelizeModule.forFeature([Campaign])],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}