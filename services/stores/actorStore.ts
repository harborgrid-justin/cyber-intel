
import { ThreatActor } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';
import { Result, ok, fail, AppError } from '../../types/result';
import { bus, EVENTS } from '../eventBus';

export class ActorStore extends BaseStore<ThreatActor> {
  constructor(key: string, initialData: ThreatActor[], adapter: DatabaseAdapter, mapper?: DataMapper<ThreatActor>) {
    super(key, initialData, adapter, mapper);
  }

  protected override initializeEventSubscriptions(): void {
    // Listen for campaign updates that might affect actors
    bus.on(EVENTS.DATA_UPDATE, (payload: any) => {
      if (payload?.storeKey === 'CAMPAIGNS') {
        this.notify();
      }
    });
  }

  linkCampaign(actorId: string, campaignName: string): Result<void> {
    try {
      const res = this.getById(actorId);
      if (res.success && res.data) {
        const actor = res.data;
        if (!actor.campaigns.includes(campaignName)) {
          actor.campaigns.push(campaignName);
          return this.update(actor);
        }
        return ok(undefined);
      }
      return fail(new AppError('Actor not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to link campaign', 'SYSTEM', { originalError: e }));
    }
  }

  addInfrastructure(actorId: string, infra: any): Result<void> {
    try {
      const res = this.getById(actorId);
      if (res.success && res.data) {
        const actor = res.data;
        actor.infrastructure.push(infra);
        return this.update(actor);
      }
      return fail(new AppError('Actor not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to add infrastructure', 'SYSTEM', { originalError: e }));
    }
  }

  addExploit(actorId: string, exploit: string): Result<void> {
    try {
      const res = this.getById(actorId);
      if (res.success && res.data) {
        const actor = res.data;
        if (!actor.exploits.includes(exploit)) {
          actor.exploits.push(exploit);
          return this.update(actor);
        }
        return ok(undefined);
      }
      return fail(new AppError('Actor not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to add exploit', 'SYSTEM', { originalError: e }));
    }
  }

  addTarget(actorId: string, target: string): Result<void> {
    try {
      const res = this.getById(actorId);
      if (res.success && res.data) {
        const actor = res.data;
        if (!actor.targets.includes(target)) {
          actor.targets.push(target);
          return this.update(actor);
        }
        return ok(undefined);
      }
      return fail(new AppError('Actor not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to add target', 'SYSTEM', { originalError: e }));
    }
  }

  addTTP(actorId: string, ttp: any): Result<void> {
    try {
      const res = this.getById(actorId);
      if (res.success && res.data) {
        const actor = res.data;
        actor.ttps.push(ttp);
        return this.update(actor);
      }
      return fail(new AppError('Actor not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to add TTP', 'SYSTEM', { originalError: e }));
    }
  }

  addReference(actorId: string, ref: string): Result<void> {
    try {
      const res = this.getById(actorId);
      if (res.success && res.data) {
        const actor = res.data;
        actor.references.push(ref);
        return this.update(actor);
      }
      return fail(new AppError('Actor not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to add reference', 'SYSTEM', { originalError: e }));
    }
  }

  removeReference(actorId: string, ref: string): Result<void> {
    try {
      const res = this.getById(actorId);
      if (res.success && res.data) {
        const actor = res.data;
        actor.references = actor.references.filter(r => r !== ref);
        return this.update(actor);
      }
      return fail(new AppError('Actor not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to remove reference', 'SYSTEM', { originalError: e }));
    }
  }

  addHistoryEvent(actorId: string, event: any): Result<void> {
    try {
      const res = this.getById(actorId);
      if (res.success && res.data) {
        const actor = res.data;
        actor.history.unshift(event);
        return this.update(actor);
      }
      return fail(new AppError('Actor not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to add history event', 'SYSTEM', { originalError: e }));
    }
  }
}
