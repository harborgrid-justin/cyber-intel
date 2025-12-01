import { ForensicJob, ParserRule, EnrichmentModule, NormalizationRule } from '../src/types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class DetectionStore {
  private forensicJobsStore: BaseStore<ForensicJob>;
  private parserRulesStore: BaseStore<ParserRule>;
  private enrichmentModulesStore: BaseStore<EnrichmentModule>;
  private normalizationRulesStore: BaseStore<NormalizationRule>;

  constructor(
    key: string,
    initialForensicJobs: ForensicJob[],
    adapter: DatabaseAdapter,
    mapper?: DataMapper<any>
  ) {
    this.forensicJobsStore = new BaseStore(`${key}_forensic_jobs`, initialForensicJobs, adapter, mapper);
    this.parserRulesStore = new BaseStore(`${key}_parser_rules`, [], adapter, mapper);
    this.enrichmentModulesStore = new BaseStore(`${key}_enrichment_modules`, [], adapter, mapper);
    this.normalizationRulesStore = new BaseStore(`${key}_normalization_rules`, [], adapter, mapper);
  }

  // Forensic Jobs
  getForensicJobs(): ForensicJob[] {
    return this.forensicJobsStore.getAll();
  }

  getForensicJob(id: string): ForensicJob | undefined {
    return this.forensicJobsStore.getById(id);
  }

  addForensicJob(job: ForensicJob): void {
    this.forensicJobsStore.add(job);
  }

  updateForensicJob(id: string, updates: Partial<ForensicJob>): ForensicJob | undefined {
    const job = this.forensicJobsStore.getById(id);
    if (job) {
      const updated = { ...job, ...updates };
      this.forensicJobsStore.update(updated);
      return updated;
    }
    return undefined;
  }

  // Parser Rules
  getParserRules(): ParserRule[] {
    return this.parserRulesStore.getAll();
  }

  addParserRule(rule: ParserRule): void {
    this.parserRulesStore.add(rule);
  }

  // Enrichment Modules
  getEnrichmentModules(): EnrichmentModule[] {
    return this.enrichmentModulesStore.getAll();
  }

  updateEnrichmentModule(id: string, status: string): EnrichmentModule | undefined {
    const module = this.enrichmentModulesStore.getById(id);
    if (module) {
      const updated = { ...module, status };
      this.enrichmentModulesStore.update(updated);
      return updated;
    }
    return undefined;
  }

  // Normalization Rules
  getNormalizationRules(): NormalizationRule[] {
    return this.normalizationRulesStore.getAll();
  }

  addNormalizationRule(rule: NormalizationRule): void {
    this.normalizationRulesStore.add(rule);
  }
}