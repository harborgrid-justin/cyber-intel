
import { ThreatActor, SystemNode } from '../../types';
import { apiClient } from '../apiClient';

export interface EvasionBreakdown {
  control: string;
  score: number;
}

interface EvasionResponse {
  score: number;
  breakdown: EvasionBreakdown[];
}

export class SimEvasionLogic {
  
  static async calculateOverallEvasion(actor: ThreatActor, node: SystemNode): Promise<number> {
    try {
      const res = await apiClient.post<EvasionResponse>('/simulation/evasion', { actorId: actor.id, nodeId: node.id });
      return res.score;
    } catch {
      // Offline Fallback
      return this.localEvasion(actor, node);
    }
  }

  static async getEvasionBreakdown(actor: ThreatActor, node: SystemNode): Promise<EvasionBreakdown[]> {
    try {
      const res = await apiClient.post<EvasionResponse>('/simulation/evasion', { actorId: actor.id, nodeId: node.id });
      return res.breakdown;
    } catch {
      return [
        { control: 'EDR (Offline)', score: this.localEvasion(actor, node) * 100 }
      ];
    }
  }

  private static localEvasion(actor: ThreatActor, node: SystemNode): number {
    let prob = 0.5;
    if (actor.sophistication === 'Advanced') prob = 0.8;
    if (node.securityControls.includes('EDR')) prob -= 0.3;
    return Math.max(0.1, prob);
  }
}
