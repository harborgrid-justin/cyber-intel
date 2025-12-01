
import { SystemNode, ResponsePlan, Playbook } from '../../types';

export class ResponseLogic {
  
  static calculateCollateralDamage(targetNodeId: string, allNodes: SystemNode[]): { score: number; impacts: string[] } {
    const target = allNodes.find(n => n.id === targetNodeId);
    if (!target) return { score: 0, impacts: [] };

    let score = 0;
    const impacts: string[] = [];

    // 1. Direct Impact
    if (target.type === 'Database') {
      score += 80;
      impacts.push(`Direct outage of Database: ${target.name}`);
    } else if (target.type === 'Server') {
      score += 50;
      impacts.push(`Service interruption on Server: ${target.name}`);
    }

    // 2. Dependency Analysis (Downstream effects)
    // Find nodes that list the target as a dependency
    const dependents = allNodes.filter(n => n.dependencies?.includes(targetNodeId));
    dependents.forEach(dep => {
      score += 20;
      impacts.push(`Degraded performance on dependent: ${dep.name}`);
      if (dep.criticalProcess) {
        score += 30;
        impacts.push(`CRITICAL PROCESS RISK: ${dep.criticalProcess} on ${dep.name}`);
      }
    });

    return { score: Math.min(100, score), impacts };
  }

  static generateResponsePlan(playbook: Playbook, targetNode: SystemNode, allNodes: SystemNode[]): ResponsePlan {
    const { score, impacts } = this.calculateCollateralDamage(targetNode.id, allNodes);
    
    // Determine action type based on playbook name heuristic
    let type: ResponsePlan['type'] = 'ISOLATION';
    if (playbook.name.includes('Patch')) type = 'PATCH';
    if (playbook.name.includes('Block')) type = 'BLOCK_IP';

    return {
      id: `PLAN-${Date.now()}`,
      name: `Execute: ${playbook.name} on ${targetNode.name}`,
      targetNodes: [targetNode.id],
      type,
      collateralDamageScore: score,
      businessImpact: impacts.length > 0 ? impacts : ['Minimal operational impact expected.'],
      successRate: 85 + (Math.random() * 10), // Simulated confidence
      status: 'DRAFT'
    };
  }
}
