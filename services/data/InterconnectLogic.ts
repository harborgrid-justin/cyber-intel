
import { 
    Threat, Case, ThreatActor, Campaign, MitreItem,
    SystemNode, Vulnerability, Vendor, SystemUser, Device, IoCFeed, SegmentationPolicy,
    Playbook, OsintBreach, OsintDarkWebItem, OsintGeo, AuditLog, ChainEvent, Pcap,
    AssetAtRisk, TrafficFlow
} from '../../types';


export class InterconnectLogic {
  
  // 1. Threat -> Asset: Blast Radius
  static correlateIoCToAsset(threat: Threat, assets: SystemNode[]): AssetAtRisk | null {
    if (threat.type !== 'IP Address' && threat.type !== 'Domain') return null;
    const victim = assets.find(a => (a.name === threat.indicator || a.ip_address === threat.indicator));
    if (!victim) return null;
    return { ...victim, activeThreats: [threat], exploitableVulns: [], riskFactor: 100 };
  }

  // 2. Vuln -> Case: Escalation
  static shouldEscalateVuln(vuln: Vulnerability): boolean {
    return vuln.score >= 9.0 && vuln.status !== 'PATCHED' && !vuln.zeroDay;
  }

  // 3. Actor -> Campaign: Attribution
  static attributeCampaign(campaign: Campaign, actors: ThreatActor[]): ThreatActor | null {
    return actors.find(actor => actor.ttps.some(t => campaign.ttps.includes(t.code))) || null;
  }

  // 4. Vendor -> Vuln: Supply Chain Shadow Risk
  static detectShadowRisk(vendor: Vendor, vulns: Vulnerability[]): number {
    return vulns.filter(v => v.vendor.toLowerCase() === vendor.name.toLowerCase() && v.status !== 'PATCHED').length;
  }

  // 5. Playbook -> Asset: Capability Check
  static checkPlaybookCompatibility(playbook: Playbook, asset: SystemNode): boolean {
    if (playbook.tasks.includes('Isolate Host')) {
      return asset.securityControls.includes('EDR') || asset.securityControls.includes('FIREWALL');
    }
    return true;
  }

  // 6. User -> Breach: Credential Stuffing
  static checkUserCompromise(user: SystemUser, breaches: OsintBreach[]): boolean {
    const userEmail = user.email || `${user.username}@sentinel.local`;
    return breaches.some(b => b.email.toLowerCase() === userEmail.toLowerCase());
  }

  // 7. Chat -> Response: Command Validation (Mock)
  static validateChatCommand(message: string): boolean {
    return message.startsWith('/execute') || message.startsWith('/isolate');
  }

  // 8. Evidence -> Case: Chain of Custody
  static validateEvidenceIntegrity(events: ChainEvent[]): boolean {
    let valid = true;
    let checkedOut = false;
    events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(e => {
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

  // 9. Audit -> Actor: Insider Threat
  static detectInsiderBehavior(userLogs: AuditLog[], knownTTPs: string[]): boolean {
     // Mock logic: check if user actions match known adversary TTP codes embedded in details
     return userLogs.some(l => knownTTPs.some(ttp => l.details.includes(ttp)));
  }

  // 10. Feed -> Firewall: Blocklist
  static generateBlockRule(threat: Threat): string | null {
    if (threat.confidence < 90) return null;
    return threat.type === 'IP Address' ? `BLOCK ${threat.indicator}` : null;
  }

  // 11. Sim -> Asset: Risk Tuning
  static adjustRiskFromSim(assetRisk: number, simSuccessProb: number): number {
    return simSuccessProb > 0.7 ? Math.min(100, assetRisk + 20) : assetRisk;
  }

  // 12. Report -> Case: Auto-fill
  static generateReportSummary(timeline: { title: string }[]): string {
    return `Incident Timeline Summary:\n${timeline.map(t => `- ${t.title}`).join('\n')}`;
  }

  // 13. Geo -> Vendor: Sanctions
  static checkVendorSanctions(vendor: Vendor, threatGeo: string): boolean {
    return vendor.hqLocation === threatGeo && ['Russia', 'North Korea', 'Iran'].includes(threatGeo);
  }

  // 14. Feed -> Scanner: Target Scope
  static getScanTargets(threats: Threat[]): string[] {
    return threats.filter(t => t.type === 'IP Address').map(t => t.indicator);
  }

  // 15. Case -> User: JIT Access
  static needsJitAccess(casePriority: string): boolean {
    return casePriority === 'CRITICAL';
  }

  // 16. Graph -> AI: Context
  static extractGraphContext(neighbors: SystemNode[]): string {
    return `Context: Connected to ${neighbors.length} nodes including ${neighbors.map(n => n.type).join(', ')}`;
  }

  // 17. NetOps -> Threat: Botnet
  static detectBotnetSurge(threats: Threat[], netFlowVolume: number): boolean {
    const botnetActivity = threats.filter(t => t.tags?.includes('Botnet') && t.status === 'NEW').length;
    return botnetActivity > 5 && netFlowVolume > 800;
  }

  // 18. VIP -> Social: Sentiment
  static adjustVipRisk(baseRisk: number, sentiment: string): number {
    return sentiment === 'Hostile' ? Math.min(100, baseRisk * 1.5) : baseRisk;
  }

  // 19. Malware -> Lab: Sandbox
  static requiresSandboxing(threat: Threat): boolean {
    return threat.type === 'File Hash' && threat.status === 'NEW';
  }

  // 20. Retention -> Compliance
  static checkRetentionCompliance(logDate: string, standard: 'NIST' | 'GDPR'): boolean {
    const days = (Date.now() - new Date(logDate).getTime()) / (1000 * 3600 * 24);
    if (standard === 'NIST') return days < 365;
    return days < 90;
  }

  // 21. MITRE -> Playbook: Coverage
  static checkPlaybookMitreCoverage(playbook: Playbook, techniques: MitreItem[]): number {
    // Mock mapping: Playbook task string contains Technique ID or Name
    let covered = 0;
    techniques.forEach(tech => {
        if (playbook.tasks.some(task => task.includes(tech.name) || task.includes(tech.id))) {
            covered++;
        }
    });
    return covered;
  }

  // 22. Campaign -> Finance: Loss Est
  static estimateCampaignLoss(campaign: Campaign): number {
    const baseCost = 50000;
    const sectorMultiplier = campaign.targetSectors.includes('Finance') ? 5 : 1;
    return baseCost * sectorMultiplier * (campaign.actors.length || 1);
  }

  // 23. Dark Web -> Vendor: Leakage
  static detectVendorLeakage(vendor: Vendor, darkWebItems: OsintDarkWebItem[]): boolean {
    return darkWebItems.some(item => item.title.toLowerCase().includes(vendor.name.toLowerCase()));
  }

  // 24. IoT -> Geo: Kinetic Tracking
  static mapDeviceToGeo(device: Device): OsintGeo | null {
     if (device.type === 'Mobile') {
         return { id: `geo-${device.id}`, ip: '0.0.0.0', city: 'Mobile', country: 'Unknown', isp: 'Cellular', asn: 'AS000', coords: '34.05, -118.25', ports: [], threatScore: 0 };
     }
     return null;
  }

  // 25. Policy -> Network: Segmentation
  static validateSegmentation(policy: SegmentationPolicy, flow: TrafficFlow): boolean {
      if (policy.action === 'DENY') {
          const matchSrc = policy.source === '*' || flow.source.includes(policy.source);
          const matchDst = policy.destination === '*' || flow.dest.includes(policy.destination);
          return !(matchSrc && matchDst); // Returns false if policy violated
      }
      return true;
  }

  // 26. PCAP -> Detection: Sigma Gen
  static generateSigmaFromPcap(pcap: Pcap): string {
      return \`
title: Detect Suspicious Traffic to \${pcap.source}
status: experimental
description: Auto-generated from PCAP \${pcap.name}
logsource:
    category: network_connection
detection:
    selection:
        DestinationIp: \${pcap.source}
        Protocol: \${pcap.protocol}
    condition: selection
      \`.trim();
  }
}
