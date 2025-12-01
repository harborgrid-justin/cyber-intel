import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DetectionController } from './detection.controller';
import { DetectionService } from './detection.service';
import { ForensicJob } from '../models/forensic-job.model';
import { ParserRule } from '../models/parser-rule.model';
import { EnrichmentModule } from '../models/enrichment-module.model';
import { NormalizationRule } from '../models/normalization-rule.model';

@Module({
  imports: [SequelizeModule.forFeature([ForensicJob, ParserRule, EnrichmentModule, NormalizationRule])],
  controllers: [DetectionController],
  providers: [DetectionService],
  exports: [DetectionService],
})
export class DetectionModule {}