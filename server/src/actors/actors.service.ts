import { Injectable } from '@nestjs/common';
import { ActorStore } from '../services/stores/actorStore';
import { MockAdapter } from '../services/dbAdapter';
import { ActorMapper } from '../services/mappers';
import { InitialDataFactory } from '../services/initialData';

@Injectable()
export class ActorsService {
  private actorStore: ActorStore;

  constructor() {
    const adapter = new MockAdapter();
    this.actorStore = new ActorStore(
      'ACTORS',
      InitialDataFactory.getActors(),
      adapter,
      new ActorMapper()
    );
  }

  findAll() {
    return this.actorStore.getAll();
  }

  findOne(id: string) {
    return this.actorStore.getById(id);
  }

  create(actor: any) {
    this.actorStore.add(actor);
    return actor;
  }

  update(id: string, actor: any) {
    this.actorStore.update(actor);
    return actor;
  }

  remove(id: string) {
    this.actorStore.delete(id);
    return { deleted: true };
  }
}
