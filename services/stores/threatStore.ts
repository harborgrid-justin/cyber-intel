
import { Threat, ThreatActor, Case, IncidentStatus, CaseId } from '../../types';
import { BaseStore } from './baseStore';
import { ThreatLogic } from '../logic/ThreatLogic';
import { CONFIG } from '../../config';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';
import { Result, ok, fail, AppError } from '../../types/result';
import { bus, EVENTS } from '../eventBus';

export class ThreatStore extends BaseStore<Threat> {
  private _memoizedThreats: Threat[] | null = null;
  private _lastClearance: string | null = null;

  constructor(key: string, initialData: Threat[], adapter: DatabaseAdapter, mapper?: DataMapper<Threat>) {
    super(key, initialData, adapter, mapper);
  }

  protected override initializeEventSubscriptions(): void {
    // Subscribe to config changes that might affect threat filtering
    bus.on(EVENTS.CONFIG_UPDATE, () => {
      this._memoizedThreats = null; // Invalidate cache
      this.notify();
    });
  }

  protected override notify() {
    this._memoizedThreats = null;
    super.notify();
  }

  getThreats(sortByScore = true, clearance: string): Threat[] {
    if (this._memoizedThreats && this._lastClearance === clearance) return this._memoizedThreats;
    
    // Use passed clearance, not hardcoded CONFIG
    let safe = this.items.map(t => ThreatLogic.enforceTLP(t, clearance));
    safe = safe.map(t => ThreatLogic.adjustThresholdsByDefcon(t, CONFIG.APP.THREAT_LEVEL));
    if (sortByScore) safe.sort((a, b) => b.score - a.score);
    
    this._memoizedThreats = safe;
    this._lastClearance = clearance;
    return safe;
  }

  getByActor(actorName: string): Threat[] {
    return this.items.filter(t => t.threatActor?.includes(actorName));
  }

  async addThreat(threat: Threat, actors: ThreatActor[], existingCases: Case[], onAutoCase: (c: Case) => void): Promise<Result<void>> {
    try {
      const { threat: proc, isDuplicate } = await ThreatLogic.deduplicateThreat(threat, this.items);
      if (proc.threatActor === 'Unknown') proc.threatActor = ThreatLogic.autoAttributedActor(proc, actors);
      const final = ThreatLogic.checkShadowIT(proc);
      await ThreatLogic.applyGeoBlocking(final);

      if (isDuplicate) {
        return this.update(final);
      } else {
        return this.add(final);
      }
    } catch (e) {
      return fail(new AppError('Failed to add threat', 'SYSTEM', { originalError: e }));
    }
  }

  updateStatus(id: string, status: IncidentStatus, existingCases: Case[], onAutoCase: (c: Case) => void): Result<void> {
    try {
      const res = this.getById(id);
      if (res.success && res.data) {
        const t = res.data;
        const updatedThreat = { ...t, status: status };
        const updateResult = this.update(updatedThreat);

        if (status === IncidentStatus.INVESTIGATING && !existingCases.find((c) => c.relatedThreatIds.includes(id))) {
          onAutoCase({ id: `CASE-${Date.now()}` as CaseId, title: `Investigation: ${t.indicator}`, description: `Auto-gen`, status: 'OPEN', priority: 'MEDIUM', assignee: 'System', reporter: 'System', tasks: [], findings: '', relatedThreatIds: [t.id], created: new Date().toISOString(), notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Auto'], tlp: 'AMBER' });
        }

        return updateResult;
      }
      return fail(new AppError('Threat not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to update threat status', 'SYSTEM', { originalError: e }));
    }
  }
}
