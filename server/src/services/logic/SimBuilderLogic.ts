
import { CampaignStep, TTPDef } from '@/types';

export const TTP_LIBRARY: Record<string, TTPDef> = {
  'Recon: Phishing': { id: 't1', name: 'Recon: Phishing', stage: 'Recon', noise: 20, cost: 500, baseSuccess: 0.65, mitreId: 'T1566', desc: 'Targeted email campaign' },
  'Recon: Port Scan': { id: 't2', name: 'Recon: Port Scan', stage: 'Recon', noise: 90, cost: 50, baseSuccess: 0.95, mitreId: 'T1595', desc: 'Aggressive IP scanning' },
  'Access: Brute Force': { id: 't3', name: 'Access: Brute Force', stage: 'Access', noise: 95, cost: 100, baseSuccess: 0.30, mitreId: 'T1110', desc: 'Credential guessing' },
  'Access: Exploit Public App': { id: 't4', name: 'Access: Exploit Public App', stage: 'Access', noise: 60, cost: 2500, baseSuccess: 0.70, mitreId: 'T1190', desc: 'Leveraging CVEs' },
  'Execution: PowerShell': { id: 't5', name: 'Execution: PowerShell', stage: 'Execution', noise: 45, cost: 0, baseSuccess: 0.85, mitreId: 'T1059', desc: 'Fileless script execution', requires: ['t3', 't4'] },
  'Persistence: Scheduled Task': { id: 't6', name: 'Persistence: Scheduled Task', stage: 'Persistence', noise: 30, cost: 0, baseSuccess: 0.90, mitreId: 'T1053', desc: 'OS-level persistence', requires: ['t5'] },
  'C2: Web Service': { id: 't7', name: 'C2: Web Service', stage: 'C2', noise: 15, cost: 400, baseSuccess: 0.95, mitreId: 'T1071', desc: 'HTTPS traffic hiding', synergy: ['t6'] },
  'Exfil: Cloud Storage': { id: 't8', name: 'Exfil: Cloud Storage', stage: 'Exfil', noise: 40, cost: 100, baseSuccess: 0.80, mitreId: 'T1567', desc: 'Upload to S3/Drive', requires: ['t7'] },
  
  // Advanced TTPs
  'PrivEsc: Token Impersonation': { id: 't9', name: 'PrivEsc: Token Impersonation', stage: 'Execution', noise: 20, cost: 1500, baseSuccess: 0.60, mitreId: 'T1134', desc: 'Steal admin token', requires: ['t5'] },
  'Defense Evasion: Disable AV': { id: 't10', name: 'Defense Evasion: Disable AV', stage: 'Execution', noise: 80, cost: 0, baseSuccess: 0.50, mitreId: 'T1562', desc: 'Kill EDR process', requires: ['t9'] },
  'Cred Access: LSASS Dump': { id: 't11', name: 'Cred Access: LSASS Dump', stage: 'Access', noise: 90, cost: 200, baseSuccess: 0.40, mitreId: 'T1003', desc: 'Dump memory', requires: ['t9'] },
  'Lateral: Pass the Hash': { id: 't12', name: 'Lateral: Pass the Hash', stage: 'Access', noise: 40, cost: 0, baseSuccess: 0.80, mitreId: 'T1550', desc: 'Move laterally', requires: ['t11'] }
};

export class SimBuilderLogic {
  static getLibrary(): TTPDef[] { return Object.values(TTP_LIBRARY); }

  static getDef(nameOrId: string): TTPDef | undefined {
    return Object.values(TTP_LIBRARY).find(t => t.name === nameOrId || t.id === nameOrId);
  }

  static validateChain(steps: CampaignStep[]): { valid: boolean; error?: string; invalidIndices: number[] } {
    if (steps.length === 0) return { valid: true, invalidIndices: [] };
    const invalidIndices: number[] = [];
    const stepDefs = steps.map(s => this.getDef(s.ttpId)!);
    
    // Check Entry
    if (!['Recon', 'Access'].includes(stepDefs[0].stage)) {
       invalidIndices.push(0);
       return { valid: false, error: 'Must start with Recon or Access', invalidIndices };
    }

    const stages = ['Recon', 'Access', 'Execution', 'Persistence', 'C2', 'Exfil'];
    let lastStageIdx = stages.indexOf(stepDefs[0].stage);

    const completedTTPs = new Set<string>([stepDefs[0].id]);

    for (let i = 1; i < stepDefs.length; i++) {
        const curr = stepDefs[i];
        const currStageIdx = stages.indexOf(curr.stage);
        
        if (curr.requires) {
            const reqMet = curr.requires.some(req => completedTTPs.has(req) || steps.slice(0,i).some(s => s.ttpId === req || this.getDef(s.ttpId)?.id === req));
            if (!reqMet) {
                invalidIndices.push(i);
            }
        }
        if (lastStageIdx !== -1 && currStageIdx !== -1 && currStageIdx < lastStageIdx) {
          invalidIndices.push(i);
        }
        
        lastStageIdx = currStageIdx;
        completedTTPs.add(curr.id);
    }
    
    return { 
      valid: invalidIndices.length === 0, 
      error: invalidIndices.length > 0 ? 'Prerequisites missing or illogical flow.' : undefined,
      invalidIndices
    };
  }

  static autoOptimize(steps: CampaignStep[]): CampaignStep[] {
    const stages = ['Recon', 'Access', 'Execution', 'Persistence', 'C2', 'Exfil'];
    return [...steps].sort((a, b) => {
      const stageA = stages.indexOf(this.getDef(a.ttpId)!.stage);
      const stageB = stages.indexOf(this.getDef(b.ttpId)!.stage);
      return stageA - stageB;
    });
  }

  static calculateMetrics(steps: CampaignStep[]) {
    let cost = 0;
    let noise = 0;
    let prob = 1.0;
    const iocs: string[] = [];
    const executedTTPs = new Set<string>();
    
    steps.forEach(s => {
      const def = this.getDef(s.ttpId);
      if(def) {
        cost += def.cost;
        let successMod = def.baseSuccess;
        if (def.synergy && def.synergy.some(id => executedTTPs.has(id))) {
            successMod = Math.min(0.99, successMod + 0.15); 
        }
        if (noise > 50) successMod *= 0.8; 
        prob *= successMod;
        noise = Math.max(noise * 0.9, def.noise); 
        iocs.push(`${def.mitreId}: ${def.stage}`);
        executedTTPs.add(def.id);
      }
    });

    return { 
      cost, 
      noise: Math.round(noise), 
      success: Math.round(prob * 100),
      iocCount: iocs.length 
    };
  }
}