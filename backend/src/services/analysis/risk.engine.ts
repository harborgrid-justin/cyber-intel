
import { Vendor } from '../../models/infrastructure';
import { Campaign } from '../../models/intelligence';

interface RiskAnalysisResult {
  exposure: number;
  breakdown: { dataBreachCost: number; downtimeCost: number; remediationCost: number };
  regulatoryRisks: string[];
  brandImpact: string;
}

export class RiskEngine {
  
  static calculateVendorRisk(vendor: Vendor): number {
    let score = 0;
    
    // 1. Geopolitical Risk
    const highRiskCountries = ['Russia', 'China', 'North Korea', 'Iran'];
    if (highRiskCountries.includes(vendor.hq_location)) score += 40;

    // 2. Operational Risk (Simulated properties as database might not have full JSON structure yet)
    if (vendor.risk_score > 80) score += 20;
    if (vendor.category === 'Hardware') score += 10; // Hardware implants risk

    return Math.min(100, score);
  }

  static async traceSupplyChainImpact(vendorId: string, allVendors: Vendor[]): Promise<string[]> {
    // BFS to find downstream dependencies (N-Tier)
    const impactedIds = new Set<string>();
    const queue = [vendorId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      // Mock logic: In real DB, we'd have a 'dependencies' join table
      // Here we assume simple tier-based dependency for the simulation
      const currentVendor = allVendors.find(v => v.id === currentId);
      
      if (currentVendor) {
        // Find vendors who might depend on this tier
        const downstream = allVendors.filter(v => 
          (v.tier === 'Tactical' && currentVendor.tier === 'Commodity') ||
          (v.tier === 'Strategic' && currentVendor.tier === 'Tactical')
        );
        
        downstream.forEach(d => {
          if (!impactedIds.has(d.id)) {
            impactedIds.add(d.id);
            queue.push(d.id);
          }
        });
      }
    }
    return Array.from(impactedIds);
  }

  static async calculateCampaignRisk(campaign: Campaign | null): Promise<RiskAnalysisResult> {
    if (!campaign) {
      return {
        exposure: 0,
        breakdown: { dataBreachCost: 0, downtimeCost: 0, remediationCost: 0 },
        regulatoryRisks: [],
        brandImpact: 'UNKNOWN'
      };
    }

    let exposure = 1000000; // Base exposure
    const riskLevel = campaign.target_sectors?.includes('Finance') ? 2 : 1;
    exposure = exposure * riskLevel;

    // Mock breakdown
    return {
        exposure,
        breakdown: { 
            dataBreachCost: exposure * 0.4, 
            downtimeCost: exposure * 0.4, 
            remediationCost: exposure * 0.2 
        },
        regulatoryRisks: ['GDPR', 'CCPA'],
        brandImpact: 'HIGH'
    };
  }
}
