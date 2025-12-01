import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { IngestionStore } from './ingestionStore';
import {
  IngestionJob,
  ParserRule,
  EnrichmentModule,
  NormalizationRule,
  IngestionJobStatus,
  ParserRuleStatus,
  EnrichmentModuleStatus
} from '@/types';

@Injectable()
export class IngestionService {
  constructor(private readonly ingestionStore: IngestionStore) {}

  // Ingestion Jobs
  async getIngestionJobs(): Promise<IngestionJob[]> {
    try {
      return this.ingestionStore.getIngestionJobs();
    } catch (error) {
      throw new HttpException('Failed to retrieve ingestion jobs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getIngestionJob(id: string): Promise<IngestionJob | null> {
    try {
      return this.ingestionStore.getIngestionJob(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createIngestionJob(jobData: Omit<IngestionJob, 'id'>): Promise<IngestionJob> {
    try {
      const job: IngestionJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...jobData,
        status: IngestionJobStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.ingestionStore.addIngestionJob(job);
      return job;
    } catch (error) {
      throw new HttpException('Failed to create ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateIngestionJob(id: string, updates: Partial<IngestionJob>): Promise<IngestionJob | null> {
    try {
      const job = this.ingestionStore.getIngestionJob(id);
      if (!job) return null;

      const updatedJob: IngestionJob = {
        ...job,
        ...updates,
        updatedAt: new Date()
      };

      this.ingestionStore.updateIngestionJob(id, updatedJob);
      return updatedJob;
    } catch (error) {
      throw new HttpException('Failed to update ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async startIngestionJob(id: string): Promise<IngestionJob | null> {
    try {
      const job = this.ingestionStore.getIngestionJob(id);
      if (!job) return null;

      if (job.status !== IngestionJobStatus.PENDING) {
        throw new HttpException('Job is not in pending state', HttpStatus.BAD_REQUEST);
      }

      const updatedJob: IngestionJob = {
        ...job,
        status: IngestionJobStatus.RUNNING,
        startedAt: new Date(),
        updatedAt: new Date()
      };

      this.ingestionStore.updateIngestionJob(id, updatedJob);
      return updatedJob;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to start ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async completeIngestionJob(id: string, count: number): Promise<IngestionJob | null> {
    try {
      const job = this.ingestionStore.getIngestionJob(id);
      if (!job) return null;

      if (job.status !== IngestionJobStatus.RUNNING) {
        throw new HttpException('Job is not in running state', HttpStatus.BAD_REQUEST);
      }

      const updatedJob: IngestionJob = {
        ...job,
        status: IngestionJobStatus.COMPLETED,
        completedAt: new Date(),
        recordsProcessed: count,
        updatedAt: new Date()
      };

      this.ingestionStore.updateIngestionJob(id, updatedJob);
      return updatedJob;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to complete ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async failIngestionJob(id: string): Promise<IngestionJob | null> {
    try {
      const job = this.ingestionStore.getIngestionJob(id);
      if (!job) return null;

      if (job.status !== IngestionJobStatus.RUNNING) {
        throw new HttpException('Job is not in running state', HttpStatus.BAD_REQUEST);
      }

      const updatedJob: IngestionJob = {
        ...job,
        status: IngestionJobStatus.FAILED,
        failedAt: new Date(),
        updatedAt: new Date()
      };

      this.ingestionStore.updateIngestionJob(id, updatedJob);
      return updatedJob;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to fail ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Parser Rules
  async getParserRules(): Promise<ParserRule[]> {
    try {
      return this.ingestionStore.getParserRules();
    } catch (error) {
      throw new HttpException('Failed to retrieve parser rules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getParserRule(id: string): Promise<ParserRule | null> {
    try {
      return this.ingestionStore.getParserRule(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve parser rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createParserRule(ruleData: Omit<ParserRule, 'id'>): Promise<ParserRule> {
    try {
      const rule: ParserRule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...ruleData,
        status: ParserRuleStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.ingestionStore.addParserRule(rule);
      return rule;
    } catch (error) {
      throw new HttpException('Failed to create parser rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateParserRule(id: string, updates: Partial<ParserRule>): Promise<ParserRule | null> {
    try {
      const rule = this.ingestionStore.getParserRule(id);
      if (!rule) return null;

      const updatedRule: ParserRule = {
        ...rule,
        ...updates,
        updatedAt: new Date()
      };

      this.ingestionStore.updateParserRule(id, updatedRule);
      return updatedRule;
    } catch (error) {
      throw new HttpException('Failed to update parser rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Enrichment Modules
  async getEnrichmentModules(): Promise<EnrichmentModule[]> {
    try {
      return this.ingestionStore.getEnrichmentModules();
    } catch (error) {
      throw new HttpException('Failed to retrieve enrichment modules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getEnrichmentModule(id: string): Promise<EnrichmentModule | null> {
    try {
      return this.ingestionStore.getEnrichmentModule(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createEnrichmentModule(moduleData: Omit<EnrichmentModule, 'id'>): Promise<EnrichmentModule> {
    try {
      const module: EnrichmentModule = {
        id: `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...moduleData,
        status: EnrichmentModuleStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.ingestionStore.addEnrichmentModule(module);
      return module;
    } catch (error) {
      throw new HttpException('Failed to create enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateEnrichmentModule(id: string, updates: Partial<EnrichmentModule>): Promise<EnrichmentModule | null> {
    try {
      const module = this.ingestionStore.getEnrichmentModule(id);
      if (!module) return null;

      const updatedModule: EnrichmentModule = {
        ...module,
        ...updates,
        updatedAt: new Date()
      };

      this.ingestionStore.updateEnrichmentModule(id, updatedModule);
      return updatedModule;
    } catch (error) {
      throw new HttpException('Failed to update enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async enableEnrichmentModule(id: string): Promise<EnrichmentModule | null> {
    try {
      return this.updateEnrichmentModule(id, { status: EnrichmentModuleStatus.ACTIVE });
    } catch (error) {
      throw new HttpException('Failed to enable enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async disableEnrichmentModule(id: string): Promise<EnrichmentModule | null> {
    try {
      return this.updateEnrichmentModule(id, { status: EnrichmentModuleStatus.DISABLED });
    } catch (error) {
      throw new HttpException('Failed to disable enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Normalization Rules
  async getNormalizationRules(): Promise<NormalizationRule[]> {
    try {
      return this.ingestionStore.getNormalizationRules();
    } catch (error) {
      throw new HttpException('Failed to retrieve normalization rules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getNormalizationRule(id: string): Promise<NormalizationRule | null> {
    try {
      return this.ingestionStore.getNormalizationRule(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve normalization rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createNormalizationRule(ruleData: Omit<NormalizationRule, 'id'>): Promise<NormalizationRule> {
    try {
      const rule: NormalizationRule = {
        id: `norm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...ruleData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.ingestionStore.addNormalizationRule(rule);
      return rule;
    } catch (error) {
      throw new HttpException('Failed to create normalization rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateNormalizationRule(id: string, updates: Partial<NormalizationRule>): Promise<NormalizationRule | null> {
    try {
      const rule = this.ingestionStore.getNormalizationRule(id);
      if (!rule) return null;

      const updatedRule: NormalizationRule = {
        ...rule,
        ...updates,
        updatedAt: new Date()
      };

      this.ingestionStore.updateNormalizationRule(id, updatedRule);
      return updatedRule;
    } catch (error) {
      throw new HttpException('Failed to update normalization rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Analytics
  async getIngestionStats(): Promise<any> {
    try {
      const jobs = this.ingestionStore.getIngestionJobs();
      const rules = this.ingestionStore.getParserRules();
      const modules = this.ingestionStore.getEnrichmentModules();

      const stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === IngestionJobStatus.RUNNING).length,
        completedJobs: jobs.filter(job => job.status === IngestionJobStatus.COMPLETED).length,
        failedJobs: jobs.filter(job => job.status === IngestionJobStatus.FAILED).length,
        totalRecordsProcessed: jobs.reduce((sum, job) => sum + (job.recordsProcessed || 0), 0),
        totalParserRules: rules.length,
        activeParserRules: rules.filter(rule => rule.status === ParserRuleStatus.ACTIVE).length,
        totalEnrichmentModules: modules.length,
        activeEnrichmentModules: modules.filter(module => module.status === EnrichmentModuleStatus.ACTIVE).length,
        averageProcessingTime: this.calculateAverageProcessingTime(jobs)
      };

      return stats;
    } catch (error) {
      throw new HttpException('Failed to retrieve ingestion statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getActiveIngestionJobs(): Promise<IngestionJob[]> {
    try {
      const jobs = this.ingestionStore.getIngestionJobs();
      return jobs.filter(job => job.status === IngestionJobStatus.RUNNING);
    } catch (error) {
      throw new HttpException('Failed to retrieve active ingestion jobs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFailedParserRules(): Promise<ParserRule[]> {
    try {
      const rules = this.ingestionStore.getParserRules();
      return rules.filter(rule => rule.status === ParserRuleStatus.FAILED);
    } catch (error) {
      throw new HttpException('Failed to retrieve failed parser rules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Data Processing
  async processIngestionData(source: string, format: string, rawData: any[]): Promise<IngestionJob> {
    try {
      // Create a new ingestion job
      const job = await this.createIngestionJob({
        source,
        format: format as 'STIX' | 'CSV' | 'JSON',
        status: IngestionJobStatus.PENDING,
        totalRecords: rawData.length,
        description: `Processing ${rawData.length} records from ${source}`
      });

      // Start the job
      await this.startIngestionJob(job.id);

      // Process the data (simplified - in real implementation, this would be async)
      let processedCount = 0;
      for (const record of rawData) {
        try {
          // Apply parser rules
          const parsedRecord = this.applyParserRules(record, format);

          // Apply enrichment modules
          const enrichedRecord = await this.applyEnrichmentModules(parsedRecord);

          // Apply normalization rules
          const _normalizedRecord = this.applyNormalizationRules(enrichedRecord);

          // Store the processed record (would integrate with other modules here)
          processedCount++;
        } catch (error) {
          console.error(`Failed to process record: ${error.message}`);
        }
      }

      // Complete the job
      await this.completeIngestionJob(job.id, processedCount);

      return this.ingestionStore.getIngestionJob(job.id)!;
    } catch (error) {
      throw new HttpException('Failed to process ingestion data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Helper methods
  private applyParserRules(record: any, format: string): any {
    const rules = this.ingestionStore.getParserRules().filter(rule =>
      rule.status === ParserRuleStatus.ACTIVE && rule.format === format
    );

    let parsedRecord = { ...record };

    for (const rule of rules) {
      try {
        // Apply regex pattern to extract fields
        const regex = new RegExp(rule.pattern);
        const match = record.raw?.match(regex);
        if (match) {
          parsedRecord = { ...parsedRecord, ...rule.fieldMapping };
          // Extract captured groups
          rule.fieldMapping.forEach((field, index) => {
            if (match[index + 1]) {
              parsedRecord[field] = match[index + 1];
            }
          });
        }
      } catch (error) {
        console.error(`Failed to apply parser rule ${rule.id}: ${error.message}`);
      }
    }

    return parsedRecord;
  }

  private async applyEnrichmentModules(record: any): Promise<any> {
    const modules = this.ingestionStore.getEnrichmentModules().filter(module =>
      module.status === EnrichmentModuleStatus.ACTIVE
    );

    let enrichedRecord = { ...record };

    for (const module of modules) {
      try {
        // Apply enrichment logic based on module type
        switch (module.type) {
          case 'geoip':
            enrichedRecord = await this.enrichWithGeoIP(enrichedRecord, module);
            break;
          case 'threat_intel':
            enrichedRecord = await this.enrichWithThreatIntel(enrichedRecord, module);
            break;
          case 'domain_lookup':
            enrichedRecord = await this.enrichWithDomainLookup(enrichedRecord, module);
            break;
          default:
            console.warn(`Unknown enrichment module type: ${module.type}`);
        }
      } catch (error) {
        console.error(`Failed to apply enrichment module ${module.id}: ${error.message}`);
      }
    }

    return enrichedRecord;
  }

  private applyNormalizationRules(record: any): any {
    const rules = this.ingestionStore.getNormalizationRules();

    let normalizedRecord = { ...record };

    for (const rule of rules) {
      try {
        // Apply normalization transformations
        if (rule.field in normalizedRecord) {
          switch (rule.transformation) {
            case 'lowercase':
              normalizedRecord[rule.field] = normalizedRecord[rule.field].toLowerCase();
              break;
            case 'uppercase':
              normalizedRecord[rule.field] = normalizedRecord[rule.field].toUpperCase();
              break;
            case 'trim':
              normalizedRecord[rule.field] = normalizedRecord[rule.field].trim();
              break;
            case 'normalize_ip':
              normalizedRecord[rule.field] = this.normalizeIP(normalizedRecord[rule.field]);
              break;
            default:
              console.warn(`Unknown normalization transformation: ${rule.transformation}`);
          }
        }
      } catch (error) {
        console.error(`Failed to apply normalization rule ${rule.id}: ${error.message}`);
      }
    }

    return normalizedRecord;
  }

  private calculateAverageProcessingTime(jobs: IngestionJob[]): number {
    const completedJobs = jobs.filter(job =>
      job.status === IngestionJobStatus.COMPLETED &&
      job.startedAt &&
      job.completedAt
    );

    if (completedJobs.length === 0) return 0;

    const totalTime = completedJobs.reduce((sum, job) => {
      return sum + (job.completedAt!.getTime() - job.startedAt!.getTime());
    }, 0);

    return totalTime / completedJobs.length;
  }

  validateParserRule(pattern: string, sampleLog: string): boolean {
    try {
      const regex = new RegExp(pattern);
      return regex.test(sampleLog);
    } catch (error) {
      return false;
    }
  }

  async testEnrichmentModule(id: string, testData: any): Promise<any> {
    const module = this.ingestionStore.getEnrichmentModule(id);
    if (!module) {
      throw new HttpException('Enrichment module not found', HttpStatus.NOT_FOUND);
    }

    try {
      // Test the enrichment module with sample data
      return await this.applyEnrichmentModules(testData);
    } catch (error) {
      throw new HttpException('Failed to test enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Enrichment helper methods
  private async enrichWithGeoIP(record: any, _module: EnrichmentModule): Promise<any> {
    // Mock GeoIP enrichment - in real implementation, would call GeoIP service
    if (record.ip) {
      record.geo = {
        country: 'US',
        city: 'New York',
        latitude: 40.7128,
        longitude: -74.0060
      };
    }
    return record;
  }

  private async enrichWithThreatIntel(record: any, _module: EnrichmentModule): Promise<any> {
    // Mock threat intelligence enrichment
    if (record.ip || record.domain) {
      record.threat_score = Math.random() * 100;
      record.threat_level = record.threat_score > 70 ? 'high' : record.threat_score > 30 ? 'medium' : 'low';
    }
    return record;
  }

  private async enrichWithDomainLookup(record: any, _module: EnrichmentModule): Promise<any> {
    // Mock domain lookup enrichment
    if (record.domain) {
      record.domain_info = {
        registrar: 'GoDaddy',
        created: new Date('2020-01-01'),
        expires: new Date('2025-01-01'),
        nameservers: ['ns1.example.com', 'ns2.example.com']
      };
    }
    return record;
  }

  private normalizeIP(ip: string): string {
    // Simple IP normalization - in real implementation, would handle IPv4/IPv6 properly
    return ip.trim();
  }
}