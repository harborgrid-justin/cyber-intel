
import { Campaign, Threat } from '../../types';
import { apiClient } from '../apiClient';

export interface RiskAnalysisResult {
  exposure: number;
  breakdown: { dataBreachCost: number; downtimeCost: number; remediationCost: number };
  regulatoryRisks: string[];
  brandImpact: string;
}

export class RiskLogic {
  
  static async calculateCampaignRisk(campaign: Campaign): Promise<RiskAnalysisResult> {
    try {
      return await apiClient.post<RiskAnalysisResult>('/analysis/campaign-risk', { campaignId: campaign.id });
    } catch (e) {
      // Robust Offline Calculation
      const sectorRiskMultiplier = campaign.targetSectors.includes('Finance') ? 2.5 : 
                                   campaign.targetSectors.includes('Defense') ? 3.0 : 1.5;
      
      const baseExposure = 500000;
      const exposure = baseExposure * sectorRiskMultiplier * (campaign.actors.length || 1);
      
      return {
        exposure,
        breakdown: { 
            dataBreachCost: exposure * 0.45, 
            downtimeCost: exposure * 0.35, 
            remediationCost: exposure * 0.20 
        },
        regulatoryRisks: ['GDPR', 'CCPA', 'SEC-Disclosures'],
        brandImpact: exposure > 2000000 ? 'SEVERE' : 'MODERATE'
      };
    }
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
      const type = t.type || 'Unknown';
      if (type === 'IP Address') stages['Reconnaissance'].push(t);
      else if (type === 'File Hash') stages['Installation'].push(t);
      else if (type === 'URL') stages['Delivery'].push(t);
      else stages['C2'].push(t);
    });

    return stages;
  }
}
