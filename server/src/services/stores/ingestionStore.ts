import {
  IngestionJob,
  ParserRule,
  EnrichmentModule,
  NormalizationRule
} from '@/types';

export class IngestionStore {
  private ingestionJobs: IngestionJob[] = [];
  private parserRules: ParserRule[] = [];
  private enrichmentModules: EnrichmentModule[] = [];
  private normalizationRules: NormalizationRule[] = [];

  constructor(
    ingestionJobs: IngestionJob[],
    parserRules: ParserRule[],
    enrichmentModules: EnrichmentModule[],
    normalizationRules: NormalizationRule[]
  ) {
    this.ingestionJobs = ingestionJobs;
    this.parserRules = parserRules;
    this.enrichmentModules = enrichmentModules;
    this.normalizationRules = normalizationRules;
  }

  // Ingestion Jobs
  getIngestionJobs(): IngestionJob[] {
    return [...this.ingestionJobs];
  }

  addIngestionJob(job: IngestionJob): void {
    this.ingestionJobs.push(job);
  }

  getIngestionJob(id: string): IngestionJob | undefined {
    return this.ingestionJobs.find(j => j.id === id);
  }

  updateIngestionJob(id: string, updates: Partial<IngestionJob>): IngestionJob | undefined {
    const index = this.ingestionJobs.findIndex(j => j.id === id);
    if (index === -1) return undefined;
    this.ingestionJobs[index] = { ...this.ingestionJobs[index], ...updates };
    return this.ingestionJobs[index];
  }

  // Parser Rules
  getParserRules(): ParserRule[] {
    return [...this.parserRules];
  }

  addParserRule(rule: ParserRule): void {
    this.parserRules.push(rule);
  }

  getParserRule(id: string): ParserRule | undefined {
    return this.parserRules.find(r => r.id === id);
  }

  updateParserRule(id: string, updates: Partial<ParserRule>): ParserRule | undefined {
    const index = this.parserRules.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.parserRules[index] = { ...this.parserRules[index], ...updates };
    return this.parserRules[index];
  }

  // Enrichment Modules
  getEnrichmentModules(): EnrichmentModule[] {
    return [...this.enrichmentModules];
  }

  addEnrichmentModule(module: EnrichmentModule): void {
    this.enrichmentModules.push(module);
  }

  getEnrichmentModule(id: string): EnrichmentModule | undefined {
    return this.enrichmentModules.find(m => m.id === id);
  }

  updateEnrichmentModule(id: string, updates: Partial<EnrichmentModule>): EnrichmentModule | undefined {
    const index = this.enrichmentModules.findIndex(m => m.id === id);
    if (index === -1) return undefined;
    this.enrichmentModules[index] = { ...this.enrichmentModules[index], ...updates };
    return this.enrichmentModules[index];
  }

  // Normalization Rules
  getNormalizationRules(): NormalizationRule[] {
    return [...this.normalizationRules];
  }

  addNormalizationRule(rule: NormalizationRule): void {
    this.normalizationRules.push(rule);
  }

  getNormalizationRule(id: string): NormalizationRule | undefined {
    return this.normalizationRules.find(r => r.id === id);
  }

  updateNormalizationRule(id: string, updates: Partial<NormalizationRule>): NormalizationRule | undefined {
    const index = this.normalizationRules.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.normalizationRules[index] = { ...this.normalizationRules[index], ...updates };
    return this.normalizationRules[index];
  }

  // Analytics
  getIngestionStats() {
    return {
      ingestionJobs: this.ingestionJobs.length,
      parserRules: this.parserRules.length,
      enrichmentModules: this.enrichmentModules.length,
      normalizationRules: this.normalizationRules.length,
      completedJobs: this.ingestionJobs.filter(j => j.status === 'COMPLETED').length,
      failedJobs: this.ingestionJobs.filter(j => j.status === 'FAILED').length,
      activeRules: this.parserRules.filter(r => r.status === 'ACTIVE').length,
      enabledModules: this.enrichmentModules.filter(m => m.enabled).length,
      totalRecordsProcessed: this.ingestionJobs.reduce((sum, job) => sum + job.count, 0)
    };
  }

  getActiveIngestionJobs(): IngestionJob[] {
    return this.ingestionJobs.filter(j => j.status === 'PROCESSING' || j.status === 'PENDING');
  }

  getFailedParserRules(): ParserRule[] {
    return this.parserRules.filter(r => r.status === 'ERROR');
  }
}