
import { ChainEvent, Vulnerability, SystemNode, ThreatActor, AuditLog, Artifact, Task, SystemUser, Device, IoCFeed, OsintSocial, Playbook } from '../../types';

export class SystemLogic {
  static validateChainOfCustody(history: ChainEvent[], newEvent: ChainEvent) { 
      const lastEvent = history[0]; 
      if (!lastEvent) return newEvent.action === 'CHECK_IN'; 
      if (newEvent.action === 'CHECK_OUT' && lastEvent.action === 'CHECK_OUT') return false;
      if (newEvent.action === 'CHECK_IN' && lastEvent.action === 'CHECK_IN') return false;
      return true; 
  }

  static assessAssetRisk(v: Vulnerability, nodes: SystemNode[]) { 
      // Enterprise: Elevate risk if vuln affects critical DB/Server infrastructure
      const criticalNodes = nodes.filter(n => n.type === 'Database' || n.type === 'Server');
      if (v.vectors.includes('Network') && criticalNodes.length > 0) {
          return { ...v, riskAmplified: true, score: Math.min(10.0, v.score + 1.0) };
      }
      return v; 
  }

  static escalateVIPTargets(actor: ThreatActor) { 
      if (actor.targets.includes('Executive') || actor.targets.includes('C-Suite')) {
          return { ...actor, sophistication: 'Advanced' as const };
      }
      return actor; 
  }

  static detectImpossibleTravel(logs: AuditLog[]): AuditLog | null {
      // Heuristic: Check for location changes > 500mph equivalent (e.g. diff location < 2hrs)
      const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      for (let i = 0; i < sorted.length - 1; i++) {
          const current = sorted[i];
          const prev = sorted[i+1];
          
          if (current.user === prev.user && current.location && prev.location && current.location !== prev.location) {
              const currTime = new Date(current.timestamp).getTime();
              const prevTime = new Date(prev.timestamp).getTime();
              
              if (!isNaN(currTime) && !isNaN(prevTime)) {
                  const timeDiff = (currTime - prevTime) / (1000 * 60 * 60);
                  if (timeDiff < 2) {
                      return {
                          id: `ALERT-${Date.now()}`, action: 'ALERT_IMPOSSIBLE_TRAVEL', user: current.user, timestamp: new Date().toISOString(),
                          details: `Impossible travel: ${prev.location} to ${current.location} in ${timeDiff.toFixed(2)}h`, location: current.location
                      };
                  }
              }
          }
      }
      return null;
  }

  static checkRetentionPolicy(a: Artifact): Artifact { 
      const RETENTION_DAYS = 365;
      const uploaded = new Date(a.uploadDate).getTime();
      if (isNaN(uploaded)) return a;

      const diffDays = (Date.now() - uploaded) / (1000 * 60 * 60 * 24);
      if (diffDays > RETENTION_DAYS && a.status !== 'ARCHIVED') {
          return { ...a, status: 'ARCHIVED' };
      }
      return a; 
  }

  static checkActorConvergence(t: ThreatActor, actors: ThreatActor[]): ThreatActor { 
      const related: string[] = t.relatedActors || [];
      actors.forEach(other => {
          if (other.id === t.id) return;
          const infraOverlap = t.infrastructure.some(i => other.infrastructure.some(oi => oi.value === i.value));
          const ttpOverlap = t.ttps.filter(ttp => other.ttps.some(ottp => ottp.code === ttp.code)).length;
          
          if ((infraOverlap || ttpOverlap >= 2) && !related.includes(other.name)) {
              related.push(other.name);
          }
      });
      return related.length !== (t.relatedActors?.length || 0) ? { ...t, relatedActors: related } : t;
  }

  static analyzeKillChain(vulns: Vulnerability[]) { 
      return vulns.map(v => {
          if (v.exploited && v.vectors.includes('Network')) return { ...v, killChainReady: true };
          return v;
      });
  }

  static detectTaskCycles(tasks: Task[], newTask: Task): boolean {
    if (!newTask.dependsOn || newTask.dependsOn.length === 0) return false;
    const queue = [...newTask.dependsOn];
    const visited = new Set<string>();
    
    while(queue.length > 0) {
        const depId = queue.shift()!;
        if (depId === newTask.id) return true;
        if (visited.has(depId)) continue;
        visited.add(depId);
        const depTask = tasks.find(t => t.id === depId);
        if (depTask && depTask.dependsOn) queue.push(...depTask.dependsOn);
    }
    return false;
  }

  static detectTimeAnomaly(log: AuditLog): AuditLog {
    try {
      const date = new Date(log.timestamp);
      if (isNaN(date.getTime())) return log;
      const hour = date.getHours();
      if ((hour < 8 || hour > 18) && ['DELETE', 'EXPORT', 'GRANT_ACCESS'].some(a => log.action.includes(a))) {
        return { ...log, details: `[ANOMALY: OFF-HOURS] ${log.details}` };
      }
      return log;
    } catch { return log; }
  }

  static trackCampaignVelocity(actor: ThreatActor): ThreatActor {
    if (!actor.campaignDates || actor.campaignDates.length < 3) return actor;
    const recent = actor.campaignDates.filter(d => (Date.now() - new Date(d).getTime()) < (90 * 86400000));
    if (recent.length >= 3 && actor.sophistication !== 'Advanced') {
      return { ...actor, sophistication: 'Advanced', description: actor.description + " [AUTO-UPGRADE: HIGH VELOCITY]" };
    }
    return actor;
  }

  static enforceDormantAccountPolicy(user: SystemUser): SystemUser {
    if (!user.lastLogin) return user;
    const lastLogin = new Date(user.lastLogin).getTime();
    if (isNaN(lastLogin)) return user;
    if ((Date.now() - lastLogin) / (86400000) > 90 && user.status !== 'LOCKED') return { ...user, status: 'LOCKED', name: user.name + " (Inactive)" };
    return user;
  }

  static validateHashIntegrity(artifact: Artifact): Artifact {
    if (artifact.originalHash && artifact.hash !== artifact.originalHash) {
      return { ...artifact, status: 'COMPROMISED', name: `[TAMPERED] ${artifact.name}` };
    }
    if (!artifact.originalHash) return { ...artifact, originalHash: artifact.hash };
    return artifact;
  }

  static analyzePlaybookEfficiency(pb: Playbook): Playbook {
    if (!pb.usageCount || !pb.skipCount || pb.usageCount < 5) return pb;
    if ((pb.skipCount / pb.usageCount) > 0.4 && pb.status !== 'DEPRECATED') return { ...pb, status: 'DEPRECATED', name: `[DEPRECATED] ${pb.name}` };
    return pb;
  }

  static prioritizeNegativeSentiment(social: OsintSocial): OsintSocial {
    if (social.sentiment === 'Negative' || social.sentiment === 'Hostile') return { ...social, priorityScore: (social.priorityScore || 0) + 20 };
    return social;
  }

  static enforceZeroTrustPatching(device: Device): Device {
    if ((device.missedPatches || 0) >= 2 && device.status !== 'QUARANTINED') return { ...device, status: 'QUARANTINED' };
    return device;
  }

  static tripFeedCircuitBreaker(feed: IoCFeed): IoCFeed {
    if ((feed.errorCount || 0) > 5 && feed.status === 'ACTIVE') return { ...feed, status: 'CIRCUIT_BROKEN', name: `[BROKEN] ${feed.name}` };
    return feed;
  }

  static monitorAnalystFatigue(user: SystemUser): SystemUser {
    if ((user.casesResolved24h || 0) > 10 && user.status !== 'FATIGUED') return { ...user, status: 'FATIGUED' };
    return user;
  }
}
