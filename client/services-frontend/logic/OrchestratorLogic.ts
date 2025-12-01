
import { SystemNode, ResponsePlan, SegmentationPolicy, TrafficFlow, Honeytoken, PatchPrioritization, Vulnerability } from '../../types';
import { SimPathLogic } from './SimPathLogic';
import { threatData } from '../dataLayer';

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
        // Risk heuristic: Sensitivity + Critical Process + Data Volume
        let nodeRisk = 10;
        if (currentNode.dataSensitivity === 'RESTRICTED') nodeRisk += 50;
        else if (currentNode.dataSensitivity === 'CONFIDENTIAL') nodeRisk += 30;
        
        if (currentNode.criticalProcess) nodeRisk += 20;
        if (currentNode.dataVolumeGB > 1000) nodeRisk += 20; // High data gravity

        riskScore += nodeRisk;
        
        // Find nodes that depend on the current node (Reverse Dependency Lookup)
        const dependents = nodes.filter(n => n.dependencies?.includes(currentId));
        dependents.forEach(dep => {
          if (!affected.has(dep.id)) {
            affected.add(dep.id);
            queue.push(dep.id);
          }
        });
      }
    }
    return { affectedNodes: Array.from(affected), riskScore: Math.min(100, riskScore / affected.size) }; // Normalize score
  }

  static validateResponseAuthority(plan: ResponsePlan, userClearance: string): boolean {
    // Automated Authority Matrix
    if (plan.collateralDamageScore > 80 && userClearance !== 'TS/SCI') return false;
    if (plan.type === 'ISOLATION' && plan.targetNodes.length > 5 && userClearance === 'Secret') return false;
    // Critical infrastructure modification requires TS
    if (plan.businessImpact.some(i => i.includes('Database') || i.includes('Core'))) {
        return userClearance === 'TS/SCI';
    }
    return true;
  }

  static estimateTimeToRecovery(node: SystemNode): string {
    // Logic based on node type and data volume
    if (node.type === 'Database') {
        const restoreTimeHours = (node.dataVolumeGB / 100); // Assume 100GB/hr restore
        return `${Math.max(1, Math.round(restoreTimeHours))}h ${Math.round((restoreTimeHours % 1)*60)}m`;
    }
    if (node.type === 'Server') return '45m'; // VM Snapshot restore
    if (node.type === 'Workstation') return '2h 15m'; // Re-image
    return '1h 00m';
  }

  // --- TAB 2: DECEPTION OPS LOGIC ---

  static recommendDecoyPlacement(nodes: SystemNode[]): { nodeId: string; reason: string; score: number }[] {
    // Logic: Place decoys on nodes with High Centrality (High Indegree) or High Value
    return nodes.map(node => {
      let score = 0;
      let reason = '';

      if (node.type === 'Database') {
        score += 80;
        reason = 'High Value Target (Crown Jewel)';
      }
      
      // Calculate Centrality (Number of nodes depending on this one)
      const dependentCount = nodes.filter(n => n.dependencies?.includes(node.id)).length;
      if (dependentCount > 2) {
        score += 40;
        reason = reason ? `${reason} + High Traffic Hub` : 'High Traffic Hub';
      }

      // Avoid placing on unstable nodes
      if (node.status === 'DEGRADED' || node.status === 'OFFLINE') {
        score -= 50; 
      }

      return { nodeId: node.id, reason, score: Math.min(100, score) };
    }).sort((a, b) => b.score - a.score).filter(r => r.score > 50);
  }

  static generateHoneytokenContent(type: 'FILE' | 'CREDENTIAL' | 'SERVICE'): string {
    if (type === 'CREDENTIAL') {
      const accessKey = `AKIA${Array.from({length:16}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random()*36)]).join('')}`;
      return `[default]\naws_access_key_id = ${accessKey}\naws_secret_access_key = ${Array.from({length:40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    }
    if (type === 'SERVICE') {
        return 'Fake MySQL Listener on Port 3306 (Low Interaction)';
    }
    return 'CONFIDENTIAL - SALARY DATA 2024.xlsx (Binary blob with tracking pixel)';
  }

  static analyzeLureEffectiveness(tokens: Honeytoken[]): number {
    if (tokens.length === 0) return 0;
    const active = tokens.filter(t => t.status === 'ACTIVE').length;
    const triggered = tokens.filter(t => t.status === 'TRIGGERED').length;
    // Ideal effectiveness is high active count with occasional triggers (true positives)
    // Too many triggers = noise/obvious. Too few = bad placement.
    const ratio = triggered / Math.max(1, active);
    if (ratio > 0.5) return 40; // Too noisy
    if (ratio > 0.1) return 90; // Good signal
    return 60; // Quiet
  }

  // --- TAB 3: SEGMENTATION LOGIC ---

  static simulatePolicy(policy: SegmentationPolicy, flows: TrafficFlow[]): { blockedCount: number; affectedServices: string[] } {
    let blockedCount = 0;
    const affected = new Set<string>();

    flows.forEach(flow => {
      // Logic: Does this flow match the policy criteria?
      const srcMatch = policy.source === '*' || flow.source.includes(policy.source) || (policy.source === 'DMZ' && flow.source.includes('WEB'));
      const dstMatch = policy.destination === '*' || flow.dest.includes(policy.destination) || (policy.destination === 'PROD' && flow.dest.includes('DB'));
      const portMatch = policy.port === '*' || flow.port === policy.port;

      if (srcMatch && dstMatch && portMatch) {
        // If policy is DENY, and flow was allowed, it WOULD be blocked
        if (policy.action === 'DENY' && flow.allowed) {
          blockedCount++;
          affected.add(flow.dest); // Service impacted
        }
        // If policy is ALLOW, checks if it's currently blocked (not implemented in mock flows)
      }
    });

    return { blockedCount, affectedServices: Array.from(affected) };
  }

  // Enhanced Lateral Path Detection linking to War Room
  static detectLateralPaths(nodes: SystemNode[]): { path: string[], risk: number, details: string }[] {
    const graph = SimPathLogic.buildGraph(nodes);
    const highValueTargets = nodes.filter(n => n.dataSensitivity === 'RESTRICTED' || n.type === 'Database');
    const entryPoints = nodes.filter(n => n.dataSensitivity === 'PUBLIC' || n.type === 'Workstation');
    
    // War Room Context: Active Threats mapped to nodes
    const activeThreats = threatData.getThreats().filter(t => t.status !== 'CLOSED');
    
    const paths: { path: string[], risk: number, details: string }[] = [];

    entryPoints.forEach(start => {
        // Is this entry point compromised?
        const isCompromised = activeThreats.some(t => t.description.includes(start.name) || t.source.includes(start.name));
        
        highValueTargets.forEach(end => {
            if (start.id === end.id) return;
            
            // BFS for connectivity
            const pathIds = this.bfs(graph, start.id, end.id);
            if (pathIds) {
                const pathNodes = pathIds.map(id => nodes.find(n => n.id === id)!);
                // Check if path traverses a segmentation control (Firewall node or Firewall control on node)
                const segmented = pathNodes.some(n => n.type === 'Firewall' || n.securityControls.includes('FIREWALL'));
                
                if (!segmented) {
                    paths.push({
                        path: pathNodes.map(n => n.name),
                        risk: isCompromised ? 95 : 75,
                        details: isCompromised 
                            ? `Active Threat on ${start.name} allows lateral movement to ${end.name}` 
                            : `Potential attack path from ${start.name} to ${end.name} lacks segmentation`
                    });
                }
            }
        });
    });
    
    // De-dupe by path string
    const uniquePaths = new Map();
    paths.forEach(p => uniquePaths.set(p.path.join('->'), p));
    return Array.from(uniquePaths.values()).sort((a,b) => b.risk - a.risk).slice(0, 5);
  }

  private static bfs(graph: Record<string, string[]>, start: string, end: string): string[] | null {
      const queue = [[start]];
      const visited = new Set([start]);
      while (queue.length > 0) {
          const path = queue.shift()!;
          const node = path[path.length - 1];
          if (node === end) return path;
          for (const neighbor of (graph[node] || [])) {
              if (!visited.has(neighbor)) {
                  visited.add(neighbor);
                  queue.push([...path, neighbor]);
              }
          }
      }
      return null;
  }

  // --- TAB 4: PATCH STRATEGY LOGIC ---

  static calculateContextualPatchRisk(vuln: Vulnerability, node: SystemNode): number {
    let score = vuln.score * 10; // Base CVSS (0-100)

    // Business Context
    if (node.criticalProcess) score += 20;
    if (node.dataSensitivity === 'RESTRICTED') score += 25;

    // Threat Context
    if (vuln.exploited) score += 30; // KEV
    if (vuln.zeroDay) score += 40;

    // Mitigating Controls (Reduce Risk)
    if (node.securityControls.includes('FIREWALL')) score -= 10;
    if (node.securityControls.includes('EDR')) score -= 15;
    if (node.status === 'ISOLATED') score -= 50; // Already mitigated by isolation

    return Math.max(0, Math.min(100, score));
  }

  static determinePatchWindow(node: SystemNode): 'IMMEDIATE' | 'NEXT_WINDOW' | 'SCHEDULED' {
    if (node.type === 'Workstation') return 'IMMEDIATE';
    if (node.criticalProcess || node.type === 'Database') return 'SCHEDULED'; // Requires downtime approval
    return 'NEXT_WINDOW';
  }
}
