
import { Threat, ThreatActor, Case, IncidentStatus, CaseId } from '../../types';
import { BaseStore } from './baseStore';
import { ThreatLogic } from '../logic/ThreatLogic';
import { CONFIG } from '../../config';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class ThreatStore extends BaseStore<Threat> {
  private _memoizedThreats: Threat[] | null = null;
  private _lastClearance: string | null = null;

  constructor(key: string, initialData: Threat[], adapter: DatabaseAdapter, mapper?: DataMapper<Threat>) {
    super(key, initialData, adapter, mapper);
  }

  protected override notify() {
    this._memoizedThreats = null;
    super.notify();
  }

  getThreats(sortByScore = true): Threat[] {
    const currentClearance = CONFIG.USER.CLEARANCE;
    if (this._memoizedThreats && this._lastClearance === currentClearance) return this._memoizedThreats;
    let safe = this.items.map(t => ThreatLogic.enforceTLP(t, currentClearance));
    safe = safe.map(t => ThreatLogic.adjustThresholdsByDefcon(t, CONFIG.APP.THREAT_LEVEL));
    if (sortByScore) safe.sort((a, b) => b.score - a.score);
    this._memoizedThreats = safe;
    this._lastClearance = currentClearance;
    return safe;
  }

  getByActor(actorName: string): Threat[] {
    return this.items.filter(t => t.threatActor?.includes(actorName));
  }

  async addThreat(threat: Threat, actors: ThreatActor[], existingCases: Case[], onAutoCase: (c: Case) => void) {
    const { threat: proc, isDuplicate } = await ThreatLogic.deduplicateThreat(threat, this.items);
    if (proc.threatActor === 'Unknown') proc.threatActor = ThreatLogic.autoAttributedActor(proc, actors);
    const final = ThreatLogic.checkShadowIT(proc); 
    await ThreatLogic.applyGeoBlocking(final);
    if (isDuplicate) this.update(final);
    else this.add(final);
  }

  updateStatus(id: string, status: IncidentStatus, existingCases: Case[], onAutoCase: (c: Case) => void) {
    const res = this.getById(id);
    if (res.success && res.data) {
      const t = res.data;
      t.status = status;
      this.update(t);
      if (status === IncidentStatus.INVESTIGATING && !existingCases.find((c) => c.relatedThreatIds.includes(id))) {
        onAutoCase({ id: `CASE-${Date.now()}` as CaseId, title: `Investigation: ${t.indicator}`, description: `Auto-generated case for high-priority threat indicator ${t.indicator}.`, status: 'OPEN', priority: 'MEDIUM', assignee: 'System', createdBy: 'System', tasks: [], findings: '', relatedThreatIds: [t.id], created: new Date().toISOString(), notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Auto-Generated'], tlp: 'AMBER' });
      }
    }
  }
}