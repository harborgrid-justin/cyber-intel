import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ForensicJob } from '../models/forensic-job.model';
import { ParserRule } from '../models/parser-rule.model';
import { EnrichmentModule } from '../models/enrichment-module.model';
import { NormalizationRule } from '../models/normalization-rule.model';
import {
  CreateForensicJobDto,
  UpdateForensicJobDto,
  CreateParserRuleDto,
  CreateNormalizationRuleDto,
} from './dto';

@Injectable()
export class DetectionService {
  constructor(
    @InjectModel(ForensicJob)
    private readonly forensicJobModel: typeof ForensicJob,
    @InjectModel(ParserRule)
    private readonly parserRuleModel: typeof ParserRule,
    @InjectModel(EnrichmentModule)
    private readonly enrichmentModuleModel: typeof EnrichmentModule,
    @InjectModel(NormalizationRule)
    private readonly normalizationRuleModel: typeof NormalizationRule,
  ) {}

  // Forensic Jobs
  async getForensicJobs(): Promise<ForensicJob[]> {
    return this.forensicJobModel.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async getForensicJob(id: string): Promise<ForensicJob> {
    const job = await this.forensicJobModel.findByPk(id);
    if (!job) {
      throw new NotFoundException(`Forensic job with ID ${id} not found`);
    }
    return job;
  }

  async createForensicJob(createForensicJobDto: CreateForensicJobDto): Promise<ForensicJob> {
    return this.forensicJobModel.create({
      ...createForensicJobDto,
      status: 'PENDING',
    } as any);
  }

  async updateForensicJob(id: string, updateForensicJobDto: UpdateForensicJobDto): Promise<ForensicJob> {
    const job = await this.forensicJobModel.findByPk(id);
    if (!job) {
      throw new NotFoundException(`Forensic job with ID ${id} not found`);
    }
    await job.update(updateForensicJobDto);
    return job;
  }

  // Parser Rules
  async getParserRules(): Promise<ParserRule[]> {
    return this.parserRuleModel.findAll({
      order: [['priority', 'DESC']],
    });
  }

  async createParserRule(createParserRuleDto: CreateParserRuleDto): Promise<ParserRule> {
    return this.parserRuleModel.create(createParserRuleDto as any);
  }

  // Enrichment Modules
  async getEnrichmentModules(): Promise<EnrichmentModule[]> {
    return this.enrichmentModuleModel.findAll({
      order: [['priority', 'DESC']],
    });
  }

  async updateEnrichmentModule(id: string, status: string): Promise<EnrichmentModule> {
    const module = await this.enrichmentModuleModel.findByPk(id);
    if (!module) {
      throw new NotFoundException(`Enrichment module with ID ${id} not found`);
    }
    await module.update({ status: status as any });
    return module;
  }

  // Normalization Rules
  async getNormalizationRules(): Promise<NormalizationRule[]> {
    return this.normalizationRuleModel.findAll({
      order: [['priority', 'DESC']],
    });
  }

  async createNormalizationRule(createNormalizationRuleDto: CreateNormalizationRuleDto): Promise<NormalizationRule> {
    return this.normalizationRuleModel.create(createNormalizationRuleDto as any);
  }
}
