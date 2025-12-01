import { Injectable } from '@nestjs/common';
import { ThreatStore } from '../services/stores/threatStore';
import { MockAdapter } from '../services/dbAdapter';
import { ThreatMapper } from '../services/mappers';
import { InitialDataFactory } from '../services/initialData';

@Injectable()
export class ThreatsService {
  private threatStore: ThreatStore;

  constructor() {
    const adapter = new MockAdapter();
    this.threatStore = new ThreatStore(
      'THREATS',
      InitialDataFactory.getThreats(),
      adapter,
      new ThreatMapper()
    );
  }

  findAll(sort: boolean = true) {
    return this.threatStore.getThreats(sort);
  }

  findOne(id: string) {
    return this.threatStore.getById(id);
  }

  create(threat: any) {
    this.threatStore.addThreat(threat, [], [], () => {});
    return threat;
  }

  update(id: string, threat: any) {
    this.threatStore.update(threat);
    return threat;
  }

  remove(id: string) {
    this.threatStore.delete(id);
    return { deleted: true };
  }

  updateStatus(id: string, status: any) {
    this.threatStore.updateStatus(id, status, [], () => {});
    return this.threatStore.getById(id);
  }

  findByActor(name: string) {
    return this.threatStore.getByActor(name);
  }
}
