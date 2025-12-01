import { Injectable } from '@nestjs/common';
import { CaseStore } from '../services/stores/caseStore';
import { MockAdapter } from '../services/dbAdapter';
import { CaseMapper } from '../services/mappers';
import { InitialDataFactory } from '../services/initialData';

@Injectable()
export class CasesService {
  private caseStore: CaseStore;

  constructor() {
    const adapter = new MockAdapter();
    this.caseStore = new CaseStore(
      'CASES',
      InitialDataFactory.getCases(),
      adapter,
      new CaseMapper()
    );
  }

  findAll() {
    return this.caseStore.getCases();
  }

  findOne(id: string) {
    return this.caseStore.getById(id);
  }

  create(caseData: any) {
    this.caseStore.addCase(caseData, [], () => {});
    return caseData;
  }

  update(id: string, caseData: any) {
    this.caseStore.update(caseData);
    return caseData;
  }

  remove(id: string) {
    this.caseStore.delete(id);
    return { deleted: true };
  }
}
