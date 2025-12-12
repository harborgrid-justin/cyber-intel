
import { IncidentReport } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';
import { Result, ok, fail, AppError } from '../../types/result';

export class ReportStore extends BaseStore<IncidentReport> {
  constructor(key: string, initialData: IncidentReport[], adapter: DatabaseAdapter, mapper?: DataMapper<IncidentReport>) {
    super(key, initialData, adapter, mapper);
  }

  publish(id: string): Result<void> {
    try {
      const res = this.getById(id);
      if (res.success && res.data) {
        const report = res.data;
        report.status = 'READY';
        return this.update(report);
      }
      return fail(new AppError('Report not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to publish report', 'SYSTEM', { originalError: e }));
    }
  }

  archive(id: string): Result<void> {
    try {
      const res = this.getById(id);
      if (res.success && res.data) {
        const report = res.data;
        report.status = 'ARCHIVED';
        return this.update(report);
      }
      return fail(new AppError('Report not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to archive report', 'SYSTEM', { originalError: e }));
    }
  }

  getByCase(caseId: string): IncidentReport[] {
    return this.items.filter(r => r.relatedCaseId === caseId);
  }

  getByActor(actorId: string): IncidentReport[] {
    return this.items.filter(r => r.relatedActorId === actorId);
  }
}
