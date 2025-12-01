import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ForensicJob } from '../models/forensic-job.model';
import { ParserRule } from '../models/parser-rule.model';
import { EnrichmentModule } from '../models/enrichment-module.model';
import { NormalizationRule } from '../models/normalization-rule.model';

@Injectable()
export class DetectionService {
  constructor(
    @InjectModel(ForensicJob)
    private forensicJobModel: typeof ForensicJob,
    @InjectModel(ParserRule)
    private parserRuleModel: typeof ParserRule,
    @InjectModel(EnrichmentModule)
    private enrichmentModuleModel: typeof EnrichmentModule,
    @InjectModel(NormalizationRule)
    private normalizationRuleModel: typeof NormalizationRule,
  ) {}

  // Forensic Jobs
  async getForensicJobs(): Promise<ForensicJob[]> {
    return this.forensicJobModel.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async getForensicJob(id: string): Promise<ForensicJob> {
    return this.forensicJobModel.findByPk(id);
  }

  async createForensicJob(jobData: Partial<ForensicJob>): Promise<ForensicJob> {
    return this.forensicJobModel.create(jobData);
  }

  async updateForensicJob(id: string, updates: Partial<ForensicJob>): Promise<ForensicJob> {
    const job = await this.forensicJobModel.findByPk(id);
    if (!job) {
      throw new Error('Forensic job not found');
    }
    await job.update(updates);
    return job;
  }

  // Parser Rules
  async getParserRules(): Promise<ParserRule[]> {
    return this.parserRuleModel.findAll({
      order: [['priority', 'DESC']],
    });
  }

  async createParserRule(ruleData: Partial<ParserRule>): Promise<ParserRule> {
    return this.parserRuleModel.create(ruleData);
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
      throw new Error('Enrichment module not found');
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

  async createNormalizationRule(ruleData: Partial<NormalizationRule>): Promise<NormalizationRule> {
    return this.normalizationRuleModel.create(ruleData);
  }
}