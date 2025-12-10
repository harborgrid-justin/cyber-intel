
import { SystemNode, Playbook, ResponsePlan } from '../../types';
import { apiClient } from '../apiClient';

export class ResponseLogic {
  
  static async calculateCollateralDamage(targetNodeId: string): Promise<{ score: number; impacts: string[] }> {
    try {
        const res = await apiClient.post<any>('/analysis/blast-radius', { nodeId: targetNodeId });
        return { score: res.riskScore, impacts: res.affectedNodes.length > 1 ? [`${res.affectedNodes.length} dependent nodes affected`] : [] };
    } catch {
        return { score: 0, impacts: [] };
    }
  }

  static async generateResponsePlan(playbook: Playbook, targetNode: SystemNode): Promise<ResponsePlan> {
    try {
        return await apiClient.post<ResponsePlan>('/analysis/response-plan', { playbookId: playbook.id, nodeId: targetNode.id });
    } catch {
        // Fallback for offline mode
        return {
            id: `PLAN-OFFLINE`,
            name: `Execute: ${playbook.name}`,
            targetNodes: [targetNode.id],
            type: 'ISOLATION',
            collateralDamageScore: 0,
            businessImpact: ['Backend unavailable - Estimation skipped'],
            successRate: 0,
            status: 'DRAFT'
        };
    }
  }
}
