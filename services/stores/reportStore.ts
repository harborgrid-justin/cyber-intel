
import { IncidentReport } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class ReportStore extends BaseStore<IncidentReport> {
  constructor(key: string, initialData: IncidentReport[], adapter: DatabaseAdapter, mapper?: DataMapper<IncidentReport>) {
    super(key, initialData, adapter, mapper);
  }

  publish(id: string) {
    const res = this.getById(id);
    if (res.success && res.data) {
      const report = res.data;
      report.status = 'READY';
      this.update(report);
    }
  }

  archive(id: string) {
    const res = this.getById(id);
    if (res.success && res.data) {
      const report = res.data;
      report.status = 'ARCHIVED';
      this.update(report);
    }
  }

  getByCase(caseId: string): IncidentReport[] {
    return this.items.filter(r => r.relatedCaseId === caseId);
  }

  getByActor(actorId: string): IncidentReport[] {
    return this.items.filter(r => r.relatedActorId === actorId);
  }
}
