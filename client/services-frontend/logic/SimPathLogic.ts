
import { SystemNode, ThreatActor, AttackStep } from '../../types';

export class SimPathLogic {
  static buildGraph(nodes: SystemNode[]) {
    // Infer connectivity: Dependencies + Subnet Adjacency (Simulated)
    const adj: Record<string, string[]> = {};
    nodes.forEach(n => {
      // Create a shallow copy of dependencies to avoid mutating the original SystemNode objects
      adj[n.id] = [...(n.dependencies || [])];
      
      // Simulate subnet visibility (nodes with same data sensitivity can see each other)
      nodes.filter(peer => peer.id !== n.id && peer.dataSensitivity === n.dataSensitivity).forEach(peer => {
        // Only add if not already present to avoid duplicates
        if (!adj[n.id].includes(peer.id)) {
          adj[n.id].push(peer.id);
        }
      });
    });
    return adj;
  }

  static calculateCompromiseProb(node: SystemNode, actor: ThreatActor): number {
    let defenseScore = 0;
    if (node.securityControls.includes('EDR')) defenseScore += 30;
    if (node.securityControls.includes('FIREWALL')) defenseScore += 20;
    if (node.status === 'ONLINE') defenseScore += 10;
    
    // Sophistication Modifier
    const attackScore = actor.sophistication === 'Advanced' ? 90 : actor.sophistication === 'Intermediate' ? 60 : 30;
    
    // Vuln Bonus
    if (node.vulnerabilities && node.vulnerabilities.length > 0) defenseScore -= 40;

    return Math.max(0.1, Math.min(0.99, (attackScore - defenseScore + 50) / 100));
  }

  static findAttackPaths(entryNodeId: string, targetNodeId: string, nodes: SystemNode[], actor: ThreatActor) {
    const graph = this.buildGraph(nodes);
    const paths: { path: string[], prob: number }[] = [];
    
    // BFS Queue: { current_node_id, current_path, cumulative_probability }
    const queue: { id: string, path: string[], prob: number }[] = [{ id: entryNodeId, path: [entryNodeId], prob: 1 }];
    
    let iterations = 0;
    // Limit iterations to prevent infinite loops in highly connected graphs
    while (queue.length > 0 && iterations < 2000) {
      iterations++;
      const { id, path, prob } = queue.shift()!;
      
      if (id === targetNodeId) {
        paths.push({ path, prob });
        continue;
      }

      const neighbors = graph[id] || [];
      neighbors.forEach(nid => {
        // Prevent cycles in the current path
        if (!path.includes(nid)) {
          const node = nodes.find(n => n.id === nid);
          if (node) {
            const stepProb = this.calculateCompromiseProb(node, actor);
            queue.push({ id: nid, path: [...path, nid], prob: prob * stepProb });
          }
        }
      });
    }
    
    // Return top 3 most probable paths
    return paths.sort((a, b) => b.prob - a.prob).slice(0, 3);
  }

  static identifyChokePoints(paths: { path: string[] }[]): Map<string, number> {
    const counts = new Map<string, number>();
    paths.forEach(p => {
      // Exclude start and end nodes from choke points usually, but keeping all for visibility
      p.path.forEach(nodeId => counts.set(nodeId, (counts.get(nodeId) || 0) + 1));
    });
    return counts;
  }

  static generateStepDescription(node: SystemNode, method: string): string {
    return `${method} on ${node.name} (${node.type}). Controls: ${node.securityControls.join(', ') || 'None'}`;
  }

  static mapToSteps(path: string[], nodes: SystemNode[]): AttackStep[] {
    return path.map((nid, i) => {
      const node = nodes.find(n => n.id === nid)!;
      const stage = i === 0 ? 'Initial Access' : i === path.length - 1 ? 'Impact' : 'Lateral Movement';
      const method = i === 0 ? 'Exploit Public App' : 'SMB/RPC Lateral';
      return {
        id: `step-${i}`, stage, node: node.name, method,
        successProbability: 0.8, description: this.generateStepDescription(node, method),
        detectionRisk: node.securityControls.length * 0.15
      };
    });
  }
}
