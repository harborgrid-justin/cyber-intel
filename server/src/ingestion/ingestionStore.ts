import { Injectable } from '@nestjs/common';
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
export class IngestionStore {
  private ingestionJobs: IngestionJob[] = [];
  private parserRules: ParserRule[] = [];
  private enrichmentModules: EnrichmentModule[] = [];
  private normalizationRules: NormalizationRule[] = [];

  constructor() {}

  // Ingestion Jobs
  getIngestionJobs(): IngestionJob[] {
    return [...this.ingestionJobs];
  }

  getIngestionJob(id: string): IngestionJob | null {
    return this.ingestionJobs.find(job => job.id === id) || null;
  }

  addIngestionJob(job: IngestionJob): void {
    this.ingestionJobs.push(job);
  }

  updateIngestionJob(id: string, updatedJob: IngestionJob): IngestionJob | null {
    const index = this.ingestionJobs.findIndex(job => job.id === id);
    if (index === -1) return null;

    this.ingestionJobs[index] = updatedJob;
    return updatedJob;
  }

  deleteIngestionJob(id: string): boolean {
    const index = this.ingestionJobs.findIndex(job => job.id === id);
    if (index === -1) return false;

    this.ingestionJobs.splice(index, 1);
    return true;
  }

  // Parser Rules
  getParserRules(): ParserRule[] {
    return [...this.parserRules];
  }

  getParserRule(id: string): ParserRule | null {
    return this.parserRules.find(rule => rule.id === id) || null;
  }

  addParserRule(rule: ParserRule): void {
    this.parserRules.push(rule);
  }

  updateParserRule(id: string, updatedRule: ParserRule): ParserRule | null {
    const index = this.parserRules.findIndex(rule => rule.id === id);
    if (index === -1) return null;

    this.parserRules[index] = updatedRule;
    return updatedRule;
  }

  deleteParserRule(id: string): boolean {
    const index = this.parserRules.findIndex(rule => rule.id === id);
    if (index === -1) return false;

    this.parserRules.splice(index, 1);
    return true;
  }

  // Enrichment Modules
  getEnrichmentModules(): EnrichmentModule[] {
    return [...this.enrichmentModules];
  }

  getEnrichmentModule(id: string): EnrichmentModule | null {
    return this.enrichmentModules.find(module => module.id === id) || null;
  }

  addEnrichmentModule(module: EnrichmentModule): void {
    this.enrichmentModules.push(module);
  }

  updateEnrichmentModule(id: string, updatedModule: EnrichmentModule): EnrichmentModule | null {
    const index = this.enrichmentModules.findIndex(module => module.id === id);
    if (index === -1) return null;

    this.enrichmentModules[index] = updatedModule;
    return updatedModule;
  }

  deleteEnrichmentModule(id: string): boolean {
    const index = this.enrichmentModules.findIndex(module => module.id === id);
    if (index === -1) return false;

    this.enrichmentModules.splice(index, 1);
    return true;
  }

  // Normalization Rules
  getNormalizationRules(): NormalizationRule[] {
    return [...this.normalizationRules];
  }

  getNormalizationRule(id: string): NormalizationRule | null {
    return this.normalizationRules.find(rule => rule.id === id) || null;
  }

  addNormalizationRule(rule: NormalizationRule): void {
    this.normalizationRules.push(rule);
  }

  updateNormalizationRule(id: string, updatedRule: NormalizationRule): NormalizationRule | null {
    const index = this.normalizationRules.findIndex(rule => rule.id === id);
    if (index === -1) return null;

    this.normalizationRules[index] = updatedRule;
    return updatedRule;
  }

  deleteNormalizationRule(id: string): boolean {
    const index = this.normalizationRules.findIndex(rule => rule.id === id);
    if (index === -1) return false;

    this.normalizationRules.splice(index, 1);
    return true;
  }

  // Analytics and Queries
  getIngestionStats(): any {
    const jobs = this.ingestionJobs;
    const rules = this.parserRules;
    const modules = this.enrichmentModules;

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.status === IngestionJobStatus.RUNNING).length,
      completedJobs: jobs.filter(job => job.status === IngestionJobStatus.COMPLETED).length,
      failedJobs: jobs.filter(job => job.status === IngestionJobStatus.FAILED).length,
      totalRecordsProcessed: jobs.reduce((sum, job) => sum + (job.recordsProcessed || 0), 0),
      totalParserRules: rules.length,
      activeParserRules: rules.filter(rule => rule.status === ParserRuleStatus.ACTIVE).length,
      totalEnrichmentModules: modules.length,
      activeEnrichmentModules: modules.filter(module => module.status === EnrichmentModuleStatus.ACTIVE).length
    };
  }

  getActiveIngestionJobs(): IngestionJob[] {
    return this.ingestionJobs.filter(job => job.status === IngestionJobStatus.RUNNING);
  }

  getFailedParserRules(): ParserRule[] {
    return this.parserRules.filter(rule => rule.status === ParserRuleStatus.FAILED);
  }

  getIngestionJobsBySource(source: string): IngestionJob[] {
    return this.ingestionJobs.filter(job => job.source === source);
  }

  getIngestionJobsByStatus(status: IngestionJobStatus): IngestionJob[] {
    return this.ingestionJobs.filter(job => job.status === status);
  }

  getParserRulesByFormat(format: string): ParserRule[] {
    return this.parserRules.filter(rule => rule.format === format);
  }

  getEnrichmentModulesByType(type: string): EnrichmentModule[] {
    return this.enrichmentModules.filter(module => module.type === type);
  }

  // Bulk operations
  clearAllData(): void {
    this.ingestionJobs = [];
    this.parserRules = [];
    this.enrichmentModules = [];
    this.normalizationRules = [];
  }

  // Search and filtering
  searchIngestionJobs(query: string): IngestionJob[] {
    const lowercaseQuery = query.toLowerCase();
    return this.ingestionJobs.filter(job =>
      job.id.toLowerCase().includes(lowercaseQuery) ||
      job.source.toLowerCase().includes(lowercaseQuery) ||
      job.description?.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchParserRules(query: string): ParserRule[] {
    const lowercaseQuery = query.toLowerCase();
    return this.parserRules.filter(rule =>
      rule.id.toLowerCase().includes(lowercaseQuery) ||
      rule.name.toLowerCase().includes(lowercaseQuery) ||
      rule.description?.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchEnrichmentModules(query: string): EnrichmentModule[] {
    const lowercaseQuery = query.toLowerCase();
    return this.enrichmentModules.filter(module =>
      module.id.toLowerCase().includes(lowercaseQuery) ||
      module.name.toLowerCase().includes(lowercaseQuery) ||
      module.description?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Validation helpers
  validateIngestionJob(job: Partial<IngestionJob>): boolean {
    return !!(
      job.source &&
      job.format &&
      typeof job.totalRecords === 'number' &&
      job.totalRecords >= 0
    );
  }

  validateParserRule(rule: Partial<ParserRule>): boolean {
    return !!(
      rule.name &&
      rule.format &&
      rule.pattern &&
      Array.isArray(rule.fieldMapping)
    );
  }

  validateEnrichmentModule(module: Partial<EnrichmentModule>): boolean {
    return !!(
      module.name &&
      module.type &&
      module.description
    );
  }

  validateNormalizationRule(rule: Partial<NormalizationRule>): boolean {
    return !!(
      rule.field &&
      rule.transformation
    );
  }
}