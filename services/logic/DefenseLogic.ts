
import { Vendor, Vulnerability, SystemNode, Campaign, ThreatActor, AttackPath, AttackStep, PatchPrioritization } from '../../types';

export class DefenseLogic {
  
  static calculateVendorRisk( vendor: Vendor, vulns: Vulnerability[], campaigns: Campaign[], actors: ThreatActor[] ): Vendor {
    const vendorVulns = vulns.filter(v => v.vendor === vendor.name && v.status !== 'PATCHED');
    const targetingCampaigns = campaigns.filter(c => c.description.toLowerCase().includes(vendor.name.toLowerCase()) || c.status === 'ACTIVE' );
    let score = 0;
    score += vendorVulns.length * 10; 
    score += vendorVulns.filter(v => v.score > 9).length * 20; 
    score += targetingCampaigns.length * 15; 
    if (['Russia', 'China', 'North Korea', 'Iran'].includes(vendor.hqLocation)) score += 40;
    if (vendor.sbom.some(c => c.critical && c.vulnerabilities > 0)) score += 25;
    if (vendor.compliance.some(c => c.status === 'EXPIRED')) score += 10;
    const finalScore = Math.min(100, score);
    return { ...vendor, riskScore: finalScore, activeVulns: vendorVulns.length, campaignsTargeting: targetingCampaigns.length, };
  }

  static calculateEvasionProbability(actor: ThreatActor, node: SystemNode): number {
    let evasionScore = 0.1;
    const techniques = actor.evasionTechniques || [];
    if (node.securityControls.includes('EDR')) {
        if (techniques.includes('Anti-VM') || techniques.includes('Rootkit')) evasionScore += 0.3;
        else evasionScore -= 0.2;
    } else { evasionScore += 0.4; }
    if (node.securityControls.includes('AV')) {
        if (techniques.includes('Packers') || techniques.includes('Fileless Malware')) evasionScore += 0.4;
        else evasionScore -= 0.1;
    }
    return Math.min(0.95, Math.max(0.05, evasionScore));
  }

  static estimateExfiltrationTime(node: SystemNode, bandwidthMbps: number = 100): string {
    const sizeMB = node.dataVolumeGB * 1024;
    const speedMBps = bandwidthMbps / 8;
    const seconds = sizeMB / speedMBps;
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    return `${(seconds / 3600).toFixed(1)} hours`;
  }

  static simulateBreach( actor: ThreatActor, nodes: SystemNode[], vulns: Vulnerability[] ): AttackPath | null {
    const actorExploits = actor.exploits || [];
    if (actorExploits.length === 0) return null;
    const pathSteps: AttackStep[] = [];
    let detectionRiskSum = 0;
    const entryNodes = nodes.filter(n => n.vulnerabilities?.some(vId => actorExploits.includes(vId)) );
    if (entryNodes.length === 0) return null;
    entryNodes.forEach(n => {
        const evasion = this.calculateEvasionProbability(actor, n);
        pathSteps.push({ id: `step-entry-${n.id}`, stage: 'Initial Access', node: n.name, method: `Exploit (${n.vulnerabilities![0]})`, successProbability: 0.9, description: `Evasion Prob: ${(evasion*100).toFixed(0)}%`, detectionRisk: 1 - evasion });
        detectionRiskSum += (1 - evasion);
    });
    return { actorId: actor.id, entryPoint: pathSteps[0]?.method || 'Unknown', steps: pathSteps, estimatedTime: '4 Hours', criticalAssetCompromised: false, totalDetectionProbability: Math.min(1, detectionRiskSum / pathSteps.length) };
  }

  static prioritizePatches(vulns: Vulnerability[], nodes: SystemNode[]): PatchPrioritization[] {
      return vulns.map(v => {
          const affectedNode = nodes.find(n => n.vulnerabilities?.includes(v.id));
          if (!affectedNode) return null;
          let score = v.score * 10;
          let reason = 'CVSS risk.';
          let criticality: PatchPrioritization['businessCriticality'] = 'LOW';
          if (affectedNode.dataSensitivity === 'RESTRICTED' || affectedNode.type === 'Database') { score += 40; criticality = 'CRITICAL'; reason = 'Protects Restricted Data.'; }
          else if (affectedNode.status === 'ONLINE' && affectedNode.type === 'Server') { score += 20; criticality = 'HIGH'; reason = 'Production Exposure.'; }
          if (v.exploited) { score += 30; reason += ' KEV CONFIRMED.'; }
          return { vulnId: v.id, assetId: affectedNode.id, score: Math.min(100, score), reason, cvss: v.score, businessCriticality: criticality };
      }).filter(Boolean) as PatchPrioritization[];
  }
}
