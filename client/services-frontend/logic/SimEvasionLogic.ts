
import { ThreatActor, SystemNode } from '../../types';

export class SimEvasionLogic {
  
  static getBaseEvasionScore(actor: ThreatActor): number {
    switch (actor.sophistication) {
      case 'Advanced': return 0.85;
      case 'Intermediate': return 0.50;
      case 'Novice': return 0.20;
      default: return 0.10;
    }
  }

  static calculateEDRBypass(actor: ThreatActor, node: SystemNode): number {
    if (!node.securityControls.includes('EDR')) return 1.0;
    let prob = this.getBaseEvasionScore(actor);
    if (actor.evasionTechniques?.includes('Rootkit')) prob += 0.2;
    if (actor.evasionTechniques?.includes('Fileless Malware')) prob += 0.15;
    return Math.min(0.95, prob);
  }

  static calculateSandboxEvasion(actor: ThreatActor): number {
    let prob = this.getBaseEvasionScore(actor);
    if (actor.evasionTechniques?.includes('Anti-VM')) prob += 0.4;
    return Math.min(0.99, prob);
  }

  static calculateNetworkEvasion(actor: ThreatActor, node: SystemNode): number {
    if (!node.securityControls.includes('FIREWALL') && !node.securityControls.includes('SIEM_AGENT')) return 1.0;
    let prob = this.getBaseEvasionScore(actor);
    if (actor.evasionTechniques?.includes('Packers')) prob += 0.1;
    return Math.min(0.90, prob);
  }

  static calculateAMSIBypass(actor: ThreatActor, node: SystemNode): number {
    if (node.type !== 'Workstation' && node.type !== 'Server') return 1.0; // AMSI mostly relevant on Windows endpoints
    let prob = this.getBaseEvasionScore(actor) - 0.1; // Harder to bypass modern AMSI
    if (actor.ttps.some(t => t.name.includes('PowerShell'))) prob += 0.1;
    return Math.max(0.05, Math.min(0.9, prob));
  }

  static assessAntiForensics(actor: ThreatActor): number {
    return actor.ttps.some(t => t.name.includes('Indicator Removal')) ? 0.9 : 0.3;
  }

  static calculateOverallEvasion(actor: ThreatActor, node: SystemNode): number {
    const edr = this.calculateEDRBypass(actor, node);
    const net = this.calculateNetworkEvasion(actor, node);
    const av = node.securityControls.includes('AV') ? (this.getBaseEvasionScore(actor) + 0.1) : 1.0;
    
    // Weighted Average based on Control Criticality
    const weighted = (edr * 0.5) + (net * 0.3) + (av * 0.2);
    return parseFloat(weighted.toFixed(2));
  }

  static getEvasionBreakdown(actor: ThreatActor, node: SystemNode) {
    return [
      { control: 'EDR / Endpoint', score: this.calculateEDRBypass(actor, node) * 100 },
      { control: 'Network / IDS', score: this.calculateNetworkEvasion(actor, node) * 100 },
      { control: 'Sandbox Analysis', score: this.calculateSandboxEvasion(actor) * 100 },
      { control: 'Static AV', score: (node.securityControls.includes('AV') ? this.getBaseEvasionScore(actor) + 0.1 : 1.0) * 100 }
    ];
  }
}
