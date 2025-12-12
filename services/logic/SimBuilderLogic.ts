
import { TTPDef } from '../../types';
import { CampaignStep } from '../../types/simulation';
import { apiClient } from '../apiClient';

// Re-export for convenience
export type { CampaignStep };

// Embedded Library for Offline Mode
const LOCAL_LIBRARY: TTPDef[] = [
  { id: 't1', name: 'Recon: Phishing', stage: 'Recon', noise: 20, cost: 500, baseSuccess: 0.65, mitreId: 'T1566', desc: 'Targeted email campaign' },
  { id: 't3', name: 'Access: Brute Force', stage: 'Access', noise: 95, cost: 100, baseSuccess: 0.30, mitreId: 'T1110', desc: 'Credential guessing' },
  { id: 't5', name: 'Execution: PowerShell', stage: 'Execution', noise: 45, cost: 0, baseSuccess: 0.85, mitreId: 'T1059', desc: 'Fileless script execution', requires: ['t3'] },
  { id: 't7', name: 'C2: Web Service', stage: 'C2', noise: 15, cost: 400, baseSuccess: 0.95, mitreId: 'T1071', desc: 'HTTPS traffic hiding' },
  { id: 't8', name: 'Exfil: Cloud Storage', stage: 'Exfil', noise: 40, cost: 100, baseSuccess: 0.80, mitreId: 'T1567', desc: 'Upload to S3/Drive', requires: ['t7'] }
];

let TTP_CACHE: TTPDef[] = [];

export class SimBuilderLogic {
  
  static async getLibrary(): Promise<TTPDef[]> {
    if (TTP_CACHE.length > 0) return TTP_CACHE;
    try {
      const libs = await apiClient.get<TTPDef[]>('/analysis/campaigns/ttp-library');
      TTP_CACHE = libs || [];
      return TTP_CACHE;
    } catch {
      TTP_CACHE = LOCAL_LIBRARY;
      return LOCAL_LIBRARY;
    }
  }

  static getDef(nameOrId: string): TTPDef | undefined {
    return TTP_CACHE.find(t => t.name === nameOrId || t.id === nameOrId);
  }

  static async validateChain(steps: CampaignStep[]): Promise<{ valid: boolean; error?: string; invalidIndices: number[] }> {
    try {
      return await apiClient.post<any>('/analysis/campaigns/validate-chain', { steps });
    } catch {
      // Simple offline validation
      if (steps.length === 0) return { valid: true, invalidIndices: [] };
      return { valid: true, invalidIndices: [] }; 
    }
  }

  static async autoOptimize(steps: CampaignStep[]): Promise<CampaignStep[]> {
    try {
      return await apiClient.post<CampaignStep[]>('/analysis/campaigns/optimize', { steps });
    } catch {
      return steps; // No-op offline
    }
  }

  static async calculateMetrics(steps: CampaignStep[]): Promise<{ cost: number, noise: number, success: number, iocCount: number }> {
    try {
      return await apiClient.post<any>('/analysis/campaigns/metrics', { steps });
    } catch {
      // Local estimation
      let cost = 0, noise = 0;
      steps.forEach(s => {
          const def = this.getDef(s.ttpId);
          if (def) { cost += def.cost; noise += def.noise / steps.length; }
      });
      return { cost, noise: Math.round(noise), success: 65, iocCount: steps.length };
    }
  }
}
