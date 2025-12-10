
import { Asset } from '../../models/infrastructure';
import { Actor } from '../../models/intelligence';

interface PathResult {
  path: string[];
  prob: number;
}

export class GraphEngine {
  
  /**
   * Builds an in-memory adjacency list from Asset data.
   * In production, this would use a Graph DB like Neo4j.
   */
  private static buildAdjacencyList(assets: Asset[]): Record<string, string[]> {
    const adj: Record<string, string[]> = {};
    assets.forEach(source => {
      adj[source.id] = [];
      assets.forEach(target => {
        if (source.id === target.id) return;
        // Logic: Assets are connected if they share a subnet (implied by type for demo)
        // or have explicit firewall rules (mocked here)
        if (source.type === target.type || source.type === 'Firewall') {
          adj[source.id].push(target.id);
        }
      });
    });
    return adj;
  }

  static calculateCompromiseProb(node: Asset, actor: Actor): number {
    let defenseScore = 50; 
    if (node.status === 'ONLINE') defenseScore += 10;
    const attackScore = actor.sophistication === 'Advanced' ? 90 : 50;
    return Math.max(0.1, Math.min(0.99, (attackScore - defenseScore + 50) / 100));
  }

  static async findBreachPaths(entryNodeId: string, targetNodeId: string, assets: Asset[], actor: Actor): Promise<PathResult[]> {
    const graph = this.buildAdjacencyList(assets);
    const paths: PathResult[] = [];
    
    // BFS with Probability Decay
    const queue = [{ id: entryNodeId, path: [entryNodeId], prob: 1 }];
    let iterations = 0;

    while (queue.length > 0 && iterations < 5000) {
      iterations++;
      const current = queue.shift()!;
      
      if (current.id === targetNodeId) {
        paths.push({ path: current.path, prob: current.prob });
        continue;
      }

      const neighbors = graph[current.id] || [];
      for (const neighborId of neighbors) {
        if (!current.path.includes(neighborId)) {
          const node = assets.find(a => a.id === neighborId);
          if (node) {
            const stepProb = this.calculateCompromiseProb(node, actor);
            // Prune low probability paths
            if (current.prob * stepProb > 0.1) {
              queue.push({
                id: neighborId,
                path: [...current.path, neighborId],
                prob: current.prob * stepProb
              });
            }
          }
        }
      }
    }

    return paths.sort((a, b) => b.prob - a.prob).slice(0, 3);
  }
}
