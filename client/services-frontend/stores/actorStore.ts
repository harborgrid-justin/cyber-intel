
import { ThreatActor } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class ActorStore extends BaseStore<ThreatActor> {
  constructor(key: string, initialData: ThreatActor[], adapter: DatabaseAdapter, mapper?: DataMapper<ThreatActor>) {
    super(key, initialData, adapter, mapper);
  }

  linkCampaign(actorId: string, campaignName: string) {
    const actor = this.getById(actorId);
    if (actor && !actor.campaigns.includes(campaignName)) {
      actor.campaigns.push(campaignName);
      this.update(actor);
    }
  }

  addInfrastructure(actorId: string, infra: any) {
    const actor = this.getById(actorId);
    if (actor) {
      actor.infrastructure.push(infra);
      this.update(actor);
    }
  }

  addExploit(actorId: string, exploit: string) {
    const actor = this.getById(actorId);
    if (actor && !actor.exploits.includes(exploit)) {
      actor.exploits.push(exploit);
      this.update(actor);
    }
  }

  addTarget(actorId: string, target: string) {
    const actor = this.getById(actorId);
    if (actor && !actor.targets.includes(target)) {
      actor.targets.push(target);
      this.update(actor);
    }
  }

  addTTP(actorId: string, ttp: any) {
    const actor = this.getById(actorId);
    if (actor) {
      actor.ttps.push(ttp);
      this.update(actor);
    }
  }

  addReference(actorId: string, ref: string) {
    const actor = this.getById(actorId);
    if (actor) {
      actor.references.push(ref);
      this.update(actor);
    }
  }

  removeReference(actorId: string, ref: string) {
    const actor = this.getById(actorId);
    if (actor) {
      actor.references = actor.references.filter(r => r !== ref);
      this.update(actor);
    }
  }

  addHistoryEvent(actorId: string, event: any) {
    const actor = this.getById(actorId);
    if (actor) {
      actor.history.unshift(event);
      this.update(actor);
    }
  }
}
