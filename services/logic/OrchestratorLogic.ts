
import { SystemNode, ResponsePlan, SegmentationPolicy, TrafficFlow, Honeytoken, PatchPrioritization, Vulnerability } from '../../types';

export class OrchestratorLogic {

  // --- TAB 1: RESPONSE TOPOLOGY LOGIC ---

  static calculateBlastRadius(entryNodeId: string, nodes: SystemNode[]): { affectedNodes: string[]; riskScore: number } {
    const affected = new Set<string>([entryNodeId]);
    const queue = [entryNodeId];
    let riskScore = 0;

    // BFS to find all downstream dependencies
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentNode = nodes.find(n => n.id === currentId);
      
      if (currentNode) {
        // Simple risk heuristic based on sensitivity
        riskScore += currentNode.dataSensitivity === 'RESTRICTED' ? 50 : currentNode.dataSensitivity === 'CONFIDENTIAL' ? 30 : 10;
        
        // Find nodes that depend on the current node
        const dependents = nodes.filter(n => n.dependencies?.includes(currentId));
        dependents.forEach(dep => {
          if (!affected.has(dep.id)) {
            affected.add(dep.id);
            queue.push(dep.id);
          }
        });
      }
    }
    return { affectedNodes: Array.from(affected), riskScore: Math.min(100, riskScore) };
  }

  static validateResponseAuthority(plan: ResponsePlan, userClearance: string): boolean {
    if (plan.collateralDamageScore > 80 && userClearance !== 'TS/SCI') return false;
    if (plan.type === 'ISOLATION' && plan.targetNodes.length > 5 && userClearance === 'Secret') return false;
    return true;
  }

  static estimateTimeToRecovery(node: SystemNode): string {
    if (node.type === 'Database') return '4h 30m'; // Database restore time
    if (node.type === 'Server') return '45m'; // VM Re-image
    if (node.type === 'Workstation') return '2h 15m'; // Remote wipe & restore
    return '1h 00m';
  }

  // --- TAB 2: DECEPTION OPS LOGIC ---

  static recommendDecoyPlacement(nodes: SystemNode[]): { nodeId: string; reason: string; score: number }[] {
    // Logic: Place decoys on nodes with high centrality (many connections) or high value (Databases)
    return nodes.map(node => {
      let score = 0;
      let reason = '';

      if (node.type === 'Database') {
        score += 80;
        reason = 'High Value Target (Crown Jewel)';
      }
      
      // Calculate rudimentary centrality (how many other nodes depend on this)
      const dependentCount = nodes.filter(n => n.dependencies?.includes(node.id)).length;
      if (dependentCount > 2) {
        score += 40;
        reason = reason ? `${reason} + High Traffic Hub` : 'High Traffic Hub';
      }

      if (node.status === 'DEGRADED') {
        score -= 50; // Don't place on unstable nodes
      }

      return { nodeId: node.id, reason, score: Math.min(100, score) };
    }).sort((a, b) => b.score - a.score).filter(r => r.score > 50);
  }

  static generateHoneytokenContent(type: 'FILE' | 'CREDENTIAL'): string {
    if (type === 'CREDENTIAL') {
      const accessKey = `AKIA${Array.from({length:16}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random()*36)]).join('')}`;
      return `[default]\naws_access_key_id = ${accessKey}\naws_secret_access_key = ${Array.from({length:40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    }
    return 'CONFIDENTIAL - SALARY DATA 2024.xlsx (Binary blob)';
  }

  static analyzeLureEffectiveness(tokens: Honeytoken[]): number {
    if (tokens.length === 0) return 0;
    const active = tokens.filter(t => t.status === 'ACTIVE').length;
    const triggered = tokens.filter(t => t.status === 'TRIGGERED').length;
    // High trigger rate might mean poor placement (noise), low means ignored. Sweet spot is specific triggers.
    // This is a simplified metric.
    return Math.round((active / (active + triggered + 1)) * 100);
  }

  // --- TAB 3: SEGMENTATION LOGIC ---

  static simulatePolicy(policy: SegmentationPolicy, flows: TrafficFlow[]): { blockedCount: number; affectedServices: string[] } {
    let blockedCount = 0;
    const affected = new Set<string>();

    flows.forEach(flow => {
      // Simplified matching logic
      const srcMatch = policy.source === '*' || flow.source.includes(policy.source) || (policy.source === 'DMZ' && flow.source.includes('WEB'));
      const dstMatch = policy.destination === '*' || flow.dest.includes(policy.destination) || (policy.destination === 'PROD' && flow.dest.includes('DB'));
      const portMatch = policy.port === '*' || flow.port === policy.port;

      if (srcMatch && dstMatch && portMatch) {
        if (policy.action === 'DENY' && flow.allowed) {
          blockedCount++;
          affected.add(flow.dest);
        }
      }
    });

    return { blockedCount, affectedServices: Array.from(affected) };
  }

  static detectLateralPaths(nodes: SystemNode[]): { path: string[], risk: number }[] {
    // Find paths from low sensitivity to high sensitivity without firewall
    const paths: { path: string[], risk: number }[] = [];
    
    const lowPriv = nodes.filter(n => n.dataSensitivity === 'PUBLIC');
    const highPriv = nodes.filter(n => n.dataSensitivity === 'RESTRICTED');

    lowPriv.forEach(start => {
      highPriv.forEach(end => {
        // Mock pathfinding: if start depends on end (reverse dependency usually, but keeping simple)
        // or if they are in same network segment 'Internal' implied.
        if (start.status === 'ONLINE' && end.status === 'ONLINE') {
           // Heuristic: If end node doesn't have firewall
           if (!end.securityControls.includes('FIREWALL')) {
             paths.push({ 
               path: [start.name, 'Switch-Core', end.name], 
               risk: 90 
             });
           }
        }
      });
    });
    return paths;
  }

  // --- TAB 4: PATCH STRATEGY LOGIC ---

  static calculateContextualPatchRisk(vuln: Vulnerability, node: SystemNode): number {
    let score = vuln.score * 10; // Base CVSS (0-100)

    // Business Context
    if (node.criticalProcess) score += 20;
    if (node.dataSensitivity === 'RESTRICTED') score += 25;

    // Threat Context
    if (vuln.exploited) score += 30;
    if (vuln.zeroDay) score += 40;

    // Mitigating Controls (Reduce Risk)
    if (node.securityControls.includes('FIREWALL')) score -= 10;
    if (node.securityControls.includes('EDR')) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  static determinePatchWindow(node: SystemNode): 'IMMEDIATE' | 'NEXT_WINDOW' | 'SCHEDULED' {
    if (node.type === 'Workstation') return 'IMMEDIATE';
    if (node.criticalProcess) return 'SCHEDULED'; // Requires downtime approval
    return 'NEXT_WINDOW';
  }
}
