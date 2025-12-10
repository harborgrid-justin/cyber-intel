
import { SystemNode, ResponsePlan, SegmentationPolicy, TrafficFlow, Honeytoken, PatchPrioritization, Vulnerability, SegmentationResult, DecoyRecommendation, LateralPath } from '../../types';
import { apiClient } from '../apiClient';

export class OrchestratorLogic {

  static async calculateBlastRadius(entryNodeId: string): Promise<{ affectedNodes: string[]; riskScore: number }> {
    try {
      return await apiClient.post<{ affectedNodes: string[]; riskScore: number }>('/analysis/blast-radius', { nodeId: entryNodeId });
    } catch (e) {
      // Offline Simulation: Returns the node itself and a mock risk score based on ID hash
      const risk = (entryNodeId.length * 7) % 100;
      return { affectedNodes: [entryNodeId], riskScore: risk < 30 ? 30 : risk };
    }
  }

  static validateResponseAuthority(plan: ResponsePlan, userClearance: string): boolean {
    if (plan.collateralDamageScore > 80 && userClearance !== 'TS/SCI') return false;
    return true;
  }

  static estimateTimeToRecovery(node: SystemNode): string {
    if (node.type === 'Database') return '4h 30m';
    return '1h 00m';
  }

  static async recommendDecoyPlacement(): Promise<DecoyRecommendation[]> {
    try {
      return await apiClient.get<DecoyRecommendation[]>('/analysis/orchestrator/decoys');
    } catch {
      return [
          { nodeId: 'n2', reason: 'High Value Database Target', score: 95 },
          { nodeId: 'n3', reason: 'Domain Controller Exposure', score: 88 }
      ];
    }
  }

  static async analyzeLureEffectiveness(tokens: Honeytoken[]): Promise<number> {
    try {
      const res = await apiClient.post<number>('/analysis/orchestrator/lure-effectiveness', { tokens });
      return res;
    } catch {
      const active = tokens.filter(t => t.status !== 'DORMANT').length;
      return Math.min(100, Math.round((active / Math.max(tokens.length, 1)) * 85));
    }
  }

  static async simulatePolicy(policy: SegmentationPolicy, flows: TrafficFlow[]): Promise<SegmentationResult> {
    try {
      return await apiClient.post<SegmentationResult>('/analysis/orchestrator/segmentation-sim', { policy, flows });
    } catch {
      // Local Logic
      const blocked = flows.filter(f => {
        if (policy.action !== 'DENY') return false;
        
        const matchSrc = policy.source === '*' || f.source.includes(policy.source);
        const matchDst = policy.destination === '*' || f.dest.includes(policy.destination);
        const matchPort = policy.port === '*' || f.port === policy.port;
        
        return matchSrc && matchDst && matchPort;
      }).length;

      return { blockedCount: blocked, affectedServices: blocked > 0 ? ['SSH', 'RDP'] : [] };
    }
  }

  static async detectLateralPaths(): Promise<LateralPath[]> {
    try {
      return await apiClient.get<LateralPath[]>('/analysis/orchestrator/lateral-paths');
    } catch {
      return [{ path: ['Workstation-01', 'Switch-Core', 'DB-Prod'], risk: 85, details: 'Unsegmented VLAN access' }];
    }
  }

  static async prioritizePatches(): Promise<PatchPrioritization[]> {
    try {
      return await apiClient.get<PatchPrioritization[]>('/analysis/orchestrator/patch-priority');
    } catch {
      return [
          { vulnId: 'CVE-2023-34362', assetId: 'DB-CLUSTER', score: 98, reason: 'Critical SQLi on Database', cvss: 9.8, businessCriticality: 'CRITICAL' },
          { vulnId: 'CVE-2023-23397', assetId: 'HQ-DC-01', score: 85, reason: 'Privilege Escalation on DC', cvss: 9.1, businessCriticality: 'HIGH' }
      ];
    }
  }

  static determinePatchWindow(node: SystemNode): 'IMMEDIATE' | 'NEXT_WINDOW' | 'SCHEDULED' {
    if (node.type === 'Workstation') return 'IMMEDIATE';
    return 'SCHEDULED';
  }
  
  static calculateContextualPatchRisk(_vuln: Vulnerability, _node: SystemNode): number {
      return 50; 
  }
}
