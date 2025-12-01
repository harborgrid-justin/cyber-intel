import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ComplianceItemsService } from './compliance-items.service';
import { ComplianceItemsController } from './compliance-items.controller';
import { ComplianceItem } from '../models';

@Module({
  imports: [SequelizeModule.forFeature([ComplianceItem])],
  controllers: [ComplianceItemsController],
  providers: [ComplianceItemsService],
  exports: [ComplianceItemsService],
})
export class ComplianceItemsModule {}