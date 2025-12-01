
import { Campaign, Threat, Case, ThreatActor } from '../../types';

export class RiskLogic {
  
  static calculateCampaignRisk(campaign: Campaign, threats: Threat[], cases: Case[]) {
    // 1. Base Cost Calculation
    const activeDays = (new Date(campaign.lastSeen).getTime() - new Date(campaign.firstSeen).getTime()) / (1000 * 3600 * 24);
    const assetCount = cases.length * 5 + threats.length; // Heuristic: 5 assets per case
    
    // 2. Sector Multipliers
    let sectorMult = 1.0;
    if (campaign.targetSectors.includes('Finance')) sectorMult = 2.5;
    if (campaign.targetSectors.includes('Defense')) sectorMult = 3.0;
    if (campaign.targetSectors.includes('Healthcare')) sectorMult = 2.2;

    // 3. Sophistication Multiplier
    const isAdvanced = campaign.actors.some(a => a.includes('APT') || a.includes('Bear') || a.includes('Panda'));
    const sophMult = isAdvanced ? 2.0 : 1.2;

    // 4. Financial Estimation
    const dataBreachCost = (assetCount * 150 * 500); // $150 per record, 500 records avg per asset
    const downtimeCost = (activeDays * 0.1) * 5600 * 60; // 10% downtime, $5600/min avg enterprise cost
    const remediationCost = (cases.length * 15000); // $15k per incident response

    const totalExposure = (dataBreachCost + downtimeCost + remediationCost) * sectorMult * sophMult;

    // 5. Regulatory Risk
    const regulatoryRisks = [];
    if (campaign.targetRegions.includes('EU')) regulatoryRisks.push('GDPR (4% Global Turnover)');
    if (campaign.targetRegions.includes('US') && campaign.targetSectors.includes('Healthcare')) regulatoryRisks.push('HIPAA ($50k/violation)');
    if (campaign.targetSectors.includes('Finance')) regulatoryRisks.push('SEC/SOX Compliance');

    return {
      exposure: totalExposure,
      breakdown: { dataBreachCost, downtimeCost, remediationCost },
      regulatoryRisks,
      brandImpact: totalExposure > 10000000 ? 'SEVERE' : totalExposure > 1000000 ? 'MODERATE' : 'LOW'
    };
  }

  static mapToKillChain(threats: Threat[]) {
    const stages = {
      'Reconnaissance': [] as Threat[],
      'Weaponization': [] as Threat[],
      'Delivery': [] as Threat[],
      'Exploitation': [] as Threat[],
      'Installation': [] as Threat[],
      'C2': [] as Threat[],
      'Actions on Objectives': [] as Threat[]
    };

    threats.forEach(t => {
      const desc = (t.description + t.type).toLowerCase();
      
      if (desc.includes('scan') || desc.includes('probe') || t.type === 'IP Address') stages['Reconnaissance'].push(t);
      else if (desc.includes('build') || desc.includes('compile') || t.type === 'File Name') stages['Weaponization'].push(t);
      else if (desc.includes('phishing') || desc.includes('email') || t.type === 'URL') stages['Delivery'].push(t);
      else if (desc.includes('exploit') || desc.includes('cve') || desc.includes('vuln')) stages['Exploitation'].push(t);
      else if (desc.includes('dropper') || desc.includes('backdoor') || desc.includes('persistence')) stages['Installation'].push(t);
      else if (desc.includes('beacon') || desc.includes('c2') || desc.includes('botnet')) stages['C2'].push(t);
      else if (desc.includes('exfil') || desc.includes('ransom') || desc.includes('encrypt')) stages['Actions on Objectives'].push(t);
      else stages['Reconnaissance'].push(t); // Default bucket
    });

    return stages;
  }
}
