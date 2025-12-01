
import { Vendor, Vulnerability, Campaign, ThreatActor, SystemNode, AttackPath, AttackStep, PatchPrioritization } from '../../types';

export class DefenseLogic {
  
  static calculateVendorRisk(
    vendor: Vendor, 
    vulns: Vulnerability[], 
    campaigns: Campaign[], 
    actors: ThreatActor[]
  ): Vendor {
    const vendorVulns = vulns.filter(v => v.vendor === vendor.name && v.status !== 'PATCHED');
    const targetingCampaigns = campaigns.filter(c => 
      c.description.toLowerCase().includes(vendor.name.toLowerCase()) || 
      c.status === 'ACTIVE'
    );
    let score = 0;
    
    // 1. Technical Vulnerabilities
    score += vendorVulns.length * 10; 
    score += vendorVulns.filter(v => v.score > 9).length * 20; 
    
    // 2. Threat Intel Context
    score += targetingCampaigns.length * 15; 
    
    // 3. Geopolitical Risk
    if (['Russia', 'China', 'North Korea', 'Iran'].includes(vendor.hqLocation)) {
        score += 40;
    }

    // 4. SBOM Analysis
    if (vendor.sbom.some(c => c.critical && c.vulnerabilities > 0)) {
        score += 25;
    }

    // 5. Compliance
    if (vendor.compliance.some(c => c.status === 'EXPIRED')) {
        score += 10;
    }
    
    // Normalize cap
    const finalScore = Math.min(100, score);
    
    return {
      ...vendor,
      riskScore: finalScore,
      activeVulns: vendorVulns.length,
      campaignsTargeting: targetingCampaigns.length,
    };
  }

  // --- Advanced Breach Simulation ---

  static calculateEvasionProbability(actor: ThreatActor, node: SystemNode): number {
    let evasionScore = 0.1; // Base probability
    const techniques = actor.evasionTechniques || [];
    
    // Check EDR
    if (node.securityControls.includes('EDR')) {
        if (techniques.includes('Anti-VM') || techniques.includes('Rootkit')) evasionScore += 0.3;
        else evasionScore -= 0.2;
    } else {
        evasionScore += 0.4; // No EDR is high risk
    }

    // Check AV
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

  static simulateBreach(
    actor: ThreatActor, 
    nodes: SystemNode[], 
    vulns: Vulnerability[]
  ): AttackPath | null {
    const actorExploits = actor.exploits || [];
    if (actorExploits.length === 0) return null;

    const pathSteps: AttackStep[] = [];
    let detectionRiskSum = 0;

    const entryNodes = nodes.filter(n => 
      n.vulnerabilities?.some(vId => actorExploits.includes(vId))
    );

    if (entryNodes.length === 0) {
      if (actor.ttps.some(t => t.name.includes('Phishing'))) {
         pathSteps.push({
           id: 'step-1', stage: 'Initial Access', method: 'Spearphishing Attachment (T1566)', 
           successProbability: 0.7, description: 'Actor sends malicious email to staff. High likelihood of user execution.',
           detectionRisk: 0.3
         });
         const workstation = nodes.find(n => n.type === 'Server'); 
         if (workstation) {
             const evasion = this.calculateEvasionProbability(actor, workstation);
             detectionRiskSum += (1 - evasion);
         }
      } else {
         return null;
      }
    } else {
      entryNodes.forEach(n => {
        const evasion = this.calculateEvasionProbability(actor, n);
        pathSteps.push({
          id: `step-entry-${n.id}`, stage: 'Initial Access', node: n.name, method: `Exploit Public Facing Application (${n.vulnerabilities![0]})`,
          successProbability: 0.9, description: `Direct exploitation of unpatched vulnerability on ${n.name}. Evasion Prob: ${(evasion*100).toFixed(0)}%`,
          detectionRisk: 1 - evasion
        });
        detectionRiskSum += (1 - evasion);
      });
    }

    const targets = nodes.filter(n => n.type === 'Database');
    // Simplified Lateral Movement
    if (pathSteps.length > 0 && targets.length > 0) {
        const target = targets[0];
        const exfilTime = this.estimateExfiltrationTime(target);
        
        pathSteps.push({
            id: `step-lat-target`, stage: 'Lateral Movement', node: target.name, method: 'Lateral Tool Transfer (T1570)',
            successProbability: 0.6, description: `Pivoting to ${target.name} via SMB.`,
            detectionRisk: target.securityControls.includes('SIEM_AGENT') ? 0.7 : 0.2
        });
        
        pathSteps.push({
            id: `step-exfil`, stage: 'Exfiltration', node: target.name, method: 'Data Exfiltration (T1048)',
            successProbability: 0.8, description: `Exfiltrating ${target.dataVolumeGB}GB of ${target.dataSensitivity} data. Est Time: ${exfilTime}`,
            detectionRisk: target.securityControls.includes('DLP') ? 0.9 : 0.1
        });
    }

    return {
      actorId: actor.id,
      entryPoint: pathSteps[0]?.method || 'Unknown',
      steps: pathSteps,
      estimatedTime: '4 Hours 15 Minutes',
      criticalAssetCompromised: pathSteps.some(s => s.stage === 'Exfiltration'),
      totalDetectionProbability: Math.min(1, detectionRiskSum / pathSteps.length)
    };
  }

  // --- Active Defense Logic ---

  static prioritizePatches(vulns: Vulnerability[], nodes: SystemNode[]): PatchPrioritization[] {
      return vulns.map(v => {
          const affectedNode = nodes.find(n => n.vulnerabilities?.includes(v.id));
          if (!affectedNode) return null;

          let score = v.score * 10; // Base CVSS weight
          let reason = 'Standard CVSS risk.';
          let criticality: PatchPrioritization['businessCriticality'] = 'LOW';

          // Contextual adjustment
          if (affectedNode.dataSensitivity === 'RESTRICTED' || affectedNode.type === 'Database') {
              score += 40;
              criticality = 'CRITICAL';
              reason = 'Protects Restricted Data / Core DB.';
          } else if (affectedNode.status === 'ONLINE' && affectedNode.type === 'Server') {
              score += 20;
              criticality = 'HIGH';
              reason = 'Production Server Exposure.';
          }

          if (v.exploited) {
              score += 30;
              reason += ' KEV CONFIRMED.';
          }

          return { vulnId: v.id, assetId: affectedNode.id, score: Math.min(100, score), reason, cvss: v.score, businessCriticality: criticality };
      }).filter(Boolean) as PatchPrioritization[];
  }
}
