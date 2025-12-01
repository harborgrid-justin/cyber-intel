import { Injectable } from '@nestjs/common';
import { IngestionStore } from '../services/stores/ingestionStore';
import {
  IngestionJob,
  ParserRule,
  EnrichmentModule,
  NormalizationRule
} from '@/types';

@Injectable()
export class IngestionService {
  private ingestionStore: IngestionStore;

  constructor() {
    // Initialize with empty arrays - mock data can be added later
    this.ingestionStore = new IngestionStore(
      [],
      [],
      [],
      []
    );
  }

  // Ingestion Jobs
  getIngestionJobs(): IngestionJob[] {
    return this.ingestionStore.getIngestionJobs();
  }

  getIngestionJob(id: string): IngestionJob | undefined {
    return this.ingestionStore.getIngestionJob(id);
  }

  createIngestionJob(job: Omit<IngestionJob, 'id'>): IngestionJob {
    const newJob: IngestionJob = {
      id: `job-${Date.now()}`,
      ...job
    };
    this.ingestionStore.addIngestionJob(newJob);
    return newJob;
  }

  updateIngestionJob(id: string, updates: Partial<IngestionJob>): IngestionJob | undefined {
    return this.ingestionStore.updateIngestionJob(id, updates);
  }

  startIngestionJob(id: string): IngestionJob | undefined {
    return this.ingestionStore.updateIngestionJob(id, { status: 'PROCESSING' });
  }

  completeIngestionJob(id: string, count: number): IngestionJob | undefined {
    return this.ingestionStore.updateIngestionJob(id, { status: 'COMPLETED', count });
  }

  failIngestionJob(id: string): IngestionJob | undefined {
    return this.ingestionStore.updateIngestionJob(id, { status: 'FAILED' });
  }

  // Parser Rules
  getParserRules(): ParserRule[] {
    return this.ingestionStore.getParserRules();
  }

  getParserRule(id: string): ParserRule | undefined {
    return this.ingestionStore.getParserRule(id);
  }

  createParserRule(rule: Omit<ParserRule, 'id'>): ParserRule {
    const newRule: ParserRule = {
      id: `rule-${Date.now()}`,
      ...rule
    };
    this.ingestionStore.addParserRule(newRule);
    return newRule;
  }

  updateParserRule(id: string, updates: Partial<ParserRule>): ParserRule | undefined {
    return this.ingestionStore.updateParserRule(id, updates);
  }

  // Enrichment Modules
  getEnrichmentModules(): EnrichmentModule[] {
    return this.ingestionStore.getEnrichmentModules();
  }

  getEnrichmentModule(id: string): EnrichmentModule | undefined {
    return this.ingestionStore.getEnrichmentModule(id);
  }

  createEnrichmentModule(module: Omit<EnrichmentModule, 'id'>): EnrichmentModule {
    const newModule: EnrichmentModule = {
      id: `module-${Date.now()}`,
      ...module
    };
    this.ingestionStore.addEnrichmentModule(newModule);
    return newModule;
  }

  updateEnrichmentModule(id: string, updates: Partial<EnrichmentModule>): EnrichmentModule | undefined {
    return this.ingestionStore.updateEnrichmentModule(id, updates);
  }

  enableEnrichmentModule(id: string): EnrichmentModule | undefined {
    return this.ingestionStore.updateEnrichmentModule(id, { enabled: true });
  }

  disableEnrichmentModule(id: string): EnrichmentModule | undefined {
    return this.ingestionStore.updateEnrichmentModule(id, { enabled: false });
  }

  // Normalization Rules
  getNormalizationRules(): NormalizationRule[] {
    return this.ingestionStore.getNormalizationRules();
  }

  getNormalizationRule(id: string): NormalizationRule | undefined {
    return this.ingestionStore.getNormalizationRule(id);
  }

  createNormalizationRule(rule: Omit<NormalizationRule, 'id'>): NormalizationRule {
    const newRule: NormalizationRule = {
      id: `norm-${Date.now()}`,
      ...rule
    };
    this.ingestionStore.addNormalizationRule(newRule);
    return newRule;
  }

  updateNormalizationRule(id: string, updates: Partial<NormalizationRule>): NormalizationRule | undefined {
    return this.ingestionStore.updateNormalizationRule(id, updates);
  }

  // Analytics
  getIngestionStats() {
    return this.ingestionStore.getIngestionStats();
  }

  getActiveIngestionJobs(): IngestionJob[] {
    return this.ingestionStore.getActiveIngestionJobs();
  }

  getFailedParserRules(): ParserRule[] {
    return this.ingestionStore.getFailedParserRules();
  }

  // Data Processing Pipeline
  processIngestionData(source: string, format: string, rawData: any[]): IngestionJob {
    const job = this.createIngestionJob({
      source,
      format: format as any,
      status: 'PENDING',
      count: 0,
      timestamp: new Date().toISOString()
    });

    // Simulate processing
    setTimeout(() => {
      this.startIngestionJob(job.id);
      // Simulate processing time
      setTimeout(() => {
        this.completeIngestionJob(job.id, rawData.length);
      }, 2000);
    }, 100);

    return job;
  }

  validateParserRule(pattern: string, sampleLog: string): boolean {
    try {
      const regex = new RegExp(pattern);
      return regex.test(sampleLog);
    } catch (error) {
      return false;
    }
  }

  testEnrichmentModule(moduleId: string, testData: any): any {
    const module = this.getEnrichmentModule(moduleId);
    if (!module || !module.enabled) {
      throw new Error('Module not found or disabled');
    }

    // Simulate enrichment based on module type
    switch (module.type) {
      case 'GEO':
        return { ...testData, geo: { country: 'US', city: 'New York' } };
      case 'ASN':
        return { ...testData, asn: { number: 12345, organization: 'Test Corp' } };
      case 'THREAT_INTEL':
        return { ...testData, threatScore: Math.floor(Math.random() * 100) };
      case 'WHOIS':
        return { ...testData, whois: { registrar: 'Test Registrar', created: '2020-01-01' } };
      case 'ASSET_DB':
        return { ...testData, assetInfo: { owner: 'Test Owner', criticality: 'HIGH' } };
      default:
        return testData;
    }
  }
}