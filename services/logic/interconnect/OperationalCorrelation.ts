
import { Campaign, ThreatActor, Playbook, SystemNode, SystemUser, OsintBreach, ChainEvent, AuditLog, MitreItem, SegmentationPolicy, TrafficFlow, Pcap } from '../../../types';

export class OperationalCorrelation {
  static attributeCampaign(campaign: Campaign, actors: ThreatActor[]): ThreatActor | null {
    return actors.find(actor => actor.ttps.some(t => campaign.ttps.includes(t.code))) || null;
  }

  static checkPlaybookCompatibility(playbook: Playbook, asset: SystemNode): boolean {
    if (playbook.tasks.includes('Isolate Host')) {
      return asset.securityControls.includes('EDR') || asset.securityControls.includes('FIREWALL');
    }
    return true;
  }

  static checkUserCompromise(user: SystemUser, breaches: OsintBreach[]): boolean {
    const userEmail = user.email || `${user.username}@sentinel.local`;
    return breaches.some(b => b.email.toLowerCase() === userEmail.toLowerCase());
  }

  static validateChatCommand(message: string): boolean {
    return message.startsWith('/execute') || message.startsWith('/isolate');
  }

  static validateEvidenceIntegrity(events: ChainEvent[]): boolean {
    let valid = true;
    let checkedOut = false;
    // Copy array before sort to avoid mutating state
    [...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(e => {
        if (e.action === 'CHECK_OUT') {
            if (checkedOut) valid = false;
            checkedOut = true;
        } else if (e.action === 'CHECK_IN') {
            if (!checkedOut) valid = false;
            checkedOut = false;
        }
    });
    return valid;
  }

  static detectInsiderBehavior(userLogs: AuditLog[], knownTTPs: string[]): boolean {
     return userLogs.some(l => knownTTPs.some(ttp => l.details.includes(ttp)));
  }

  static generateReportSummary(timeline: { title: string }[]): string {
    return `Incident Timeline Summary:\n${timeline.map(t => `- ${t.title}`).join('\n')}`;
  }

  static needsJitAccess(casePriority: string): boolean {
    return casePriority === 'CRITICAL';
  }

  static extractGraphContext(neighbors: SystemNode[]): string {
    return `Context: Connected to ${neighbors.length} nodes including ${neighbors.map(n => n.type).join(', ')}`;
  }

  static adjustVipRisk(baseRisk: number, sentiment: string): number {
    return sentiment === 'Hostile' ? Math.min(100, baseRisk * 1.5) : baseRisk;
  }

  static checkRetentionCompliance(logDate: string, standard: 'NIST' | 'GDPR'): boolean {
    const days = (Date.now() - new Date(logDate).getTime()) / (1000 * 3600 * 24);
    if (standard === 'NIST') return days < 365;
    return days < 90;
  }

  static checkPlaybookMitreCoverage(playbook: Playbook, techniques: MitreItem[]): number {
    let covered = 0;
    techniques.forEach(tech => {
        if (playbook.tasks.some(task => task.includes(tech.name) || task.includes(tech.id))) {
            covered++;
        }
    });
    return covered;
  }

  static estimateCampaignLoss(campaign: Campaign): number {
    const baseCost = 50000;
    const sectorMultiplier = campaign.targetSectors.includes('Finance') ? 5 : 1;
    return baseCost * sectorMultiplier * (campaign.actors.length || 1);
  }

  static validateSegmentation(policy: SegmentationPolicy, flow: TrafficFlow): boolean {
      if (policy.action === 'DENY') {
          const matchSrc = policy.source === '*' || flow.source.includes(policy.source);
          const matchDst = policy.destination === '*' || flow.dest.includes(policy.destination);
          return !(matchSrc && matchDst);
      }
      return true;
  }

  static generateSigmaFromPcap(pcap: Pcap): string {
      return `title: Detect Traffic to ${pcap.source}\nstatus: experimental\nlogsource:\n    category: network_connection\ndetection:\n    selection:\n        DestinationIp: ${pcap.source}\n        Protocol: ${pcap.protocol}\n    condition: selection`;
  }
}
