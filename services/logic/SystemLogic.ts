
import { ChainEvent, Malware, AuditLog, Task, Playbook, ThreatActor, Vulnerability, SystemNode, SystemUser, Device, IoCFeed, NistControl } from '../../types';
import { OsintSocial } from '../../types';
import { apiClient } from '../apiClient';

export class SystemLogic {
  static validateChainOfCustody(history: ChainEvent[], newEvent: ChainEvent) { 
      const lastEvent = history[0]; 
      if (!lastEvent) return newEvent.action === 'CHECK_IN'; 
      if (newEvent.action === 'CHECK_OUT' && lastEvent.action === 'CHECK_OUT') return false;
      if (newEvent.action === 'CHECK_IN' && lastEvent.action === 'CHECK_IN') return false;
      return true; 
  }

  static async checkNistCompliance(controls: NistControl[]): Promise<{ score: number, criticalGaps: string[] }> {
      try { return await apiClient.post('/analysis/compliance/nist', { controls }); } 
      catch { return { score: 0, criticalGaps: [] }; }
  }

  static async assessAssetRisk(node: SystemNode): Promise<any> { 
      try { return await apiClient.get(`/analysis/assets/${node.id}/risk`); } 
      catch { let risk = 0; if (node.type === 'Database') risk += 50; if (node.dataSensitivity === 'RESTRICTED') risk += 40; return { riskScore: risk, factors: ['Offline Estimate'] }; }
  }

  static async escalateVIPTargets(actor: ThreatActor): Promise<ThreatActor> { 
      try { const res = await apiClient.post<any>(`/analysis/actors/${actor.id}/escalate-vip`, {}); return res.actor; } 
      catch { if (actor.targets.includes('Executive')) { return { ...actor, sophistication: 'Advanced' as const }; } return actor; }
  }

  static async detectImpossibleTravel(): Promise<AuditLog[]> {
      try { return await apiClient.get<AuditLog[]>('/analysis/compliance/travel'); } 
      catch { return []; }
  }

  static async checkRetentionPolicy(): Promise<void> { 
      try { await apiClient.post('/analysis/lifecycle/system/retention', {}); } 
      catch { }
  }

  static checkActorConvergence(t: ThreatActor, actors: ThreatActor[]): ThreatActor { 
      const related: string[] = t.relatedActors || [];
      actors.forEach(other => {
          if (other.id === t.id) return;
          const infra = t.infrastructure.some(i => other.infrastructure.some(oi => oi.value === i.value));
          const ttp = t.ttps.filter(ttp => other.ttps.some(ottp => ottp.code === ttp.code)).length;
          if ((infra || ttp >= 2) && !related.includes(other.name)) related.push(other.name);
      });
      return related.length !== (t.relatedActors?.length || 0) ? { ...t, relatedActors: related } : t;
  }

  static analyzeKillChain(vulns: Vulnerability[]) { 
      return vulns.map(v => {
          if (v.exploited && v.vectors.includes('Network')) return { ...v, killChainReady: true };
          return v;
      });
  }

  static detectTaskCycles(tasks: Task[], newTask: Task): boolean { return false; }
  static detectTimeAnomaly(log: AuditLog): AuditLog { return log; }
  static trackCampaignVelocity(actor: ThreatActor): ThreatActor { return actor; }
  static enforceDormantAccountPolicy(user: SystemUser): SystemUser { return user; }
  static validateHashIntegrity(artifact: any): any { return artifact; }
  static analyzePlaybookEfficiency(pb: Playbook): Playbook { return pb; }
  static prioritizeNegativeSentiment(social: OsintSocial): OsintSocial { return social; }
  static enforceZeroTrustPatching(device: Device): Device { return device; }
  static tripFeedCircuitBreaker(feed: IoCFeed): IoCFeed { return feed; }
  static async monitorAnalystFatigue(): Promise<void> {}
}
