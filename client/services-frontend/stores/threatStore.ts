
import { Threat, IncidentStatus, ThreatActor, Case } from '../../types';
import { BaseStore } from './baseStore';
import { LogicEngine } from '../logicEngine';
import { CONFIG } from '../../config';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class ThreatStore extends BaseStore<Threat> {
  constructor(key: string, initialData: Threat[], adapter: DatabaseAdapter, mapper?: DataMapper<Threat>) {
    super(key, initialData, adapter, mapper);
  }

  getThreats(sortByScore = true): Threat[] {
    let safe = this.items.map(t => LogicEngine.enforceTLP(t, CONFIG.USER.CLEARANCE));
    safe = safe.map(t => LogicEngine.adjustThresholdsByDefcon(t, CONFIG.APP.THREAT_LEVEL));
    return sortByScore ? safe.sort((a, b) => b.score - a.score) : safe;
  }

  getByActor(actorName: string): Threat[] {
    return this.items.filter(t => t.threatActor?.includes(actorName));
  }

  addThreat(threat: Threat, actors: ThreatActor[], existingCases: Case[], onAutoCase: (c: Case) => void) {
    const { threat: proc, isDuplicate } = LogicEngine.deduplicateThreat(threat, this.items);
    if (proc.threatActor === 'Unknown') proc.threatActor = LogicEngine.autoAttributedActor(proc, actors);
    const final = LogicEngine.checkShadowIT(LogicEngine.applyGeoBlocking(proc));

    if (isDuplicate) {
      this.update(final);
    } else {
      this.add(final);
      const susp = LogicEngine.checkSubnetPattern(this.items);
      if (susp && !existingCases.find((c) => c.title.includes(susp))) {
        onAutoCase({ 
          id: `CASE-SUBNET-${Date.now()}`, title: `Subnet Sweep: ${susp}`, 
          description: 'Heuristic', status: 'OPEN', priority: 'HIGH', 
          assignee: 'System', reporter: 'LogicEngine', tasks: [], 
          findings: '', relatedThreatIds: [], created: new Date().toISOString(), 
          notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', 
          sharingScope: 'INTERNAL', sharedWith: [], labels: ['Heuristic'], tlp: 'AMBER' 
        });
      }
    }
  }

  updateStatus(id: string, status: IncidentStatus, existingCases: Case[], onAutoCase: (c: Case) => void) {
    const t = this.getById(id);
    if (t) {
      t.status = status;
      this.update(t);
      if (status === IncidentStatus.INVESTIGATING && !existingCases.find((c) => c.relatedThreatIds.includes(id))) {
        onAutoCase({ 
          id: `CASE-${Date.now()}`, title: `Investigation: ${t.indicator}`, 
          description: `Auto-gen`, status: 'OPEN', priority: 'MEDIUM', 
          assignee: 'System', reporter: 'System', tasks: [], 
          findings: '', relatedThreatIds: [t.id], created: new Date().toISOString(), 
          notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', 
          sharingScope: 'INTERNAL', sharedWith: [], labels: ['Auto'], tlp: 'AMBER' 
        });
      }
    }
  }
}
