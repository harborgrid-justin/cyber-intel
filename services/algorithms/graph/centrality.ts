/**
 * Centrality Measures for Graph Analysis
 *
 * Time Complexity varies by algorithm:
 * - Degree Centrality: O(V + E)
 * - Betweenness Centrality: O(V * E) for unweighted, O(V * E + V^2 * log V) for weighted
 * - Closeness Centrality: O(V * E)
 * - Eigenvector Centrality: O(V + E) per iteration
 *
 * Use Cases:
 * - Identifying key threat actors (high betweenness)
 * - Finding central infrastructure nodes (high closeness)
 * - Detecting influential malware spreaders (high degree)
 * - Ranking critical vulnerabilities (high eigenvector)
 */

export interface CentralityScores {
  nodeId: string;
  degree: number;
  betweenness: number;
  closeness: number;
  eigenvector: number;
  [key: string]: any;
}

export interface CentralityResult {
  scores: Map<string, CentralityScores>;
  rankings: {
    byDegree: Array<{ nodeId: string; score: number }>;
    byBetweenness: Array<{ nodeId: string; score: number }>;
    byCloseness: Array<{ nodeId: string; score: number }>;
    byEigenvector: Array<{ nodeId: string; score: number }>;
  };
}

export class Centrality {
  /**
   * Calculate all centrality measures for a graph
   */
  calculateAll(
    edges: Array<{ from: string; to: string; weight?: number }>
  ): CentralityResult {
    const graph = this.buildGraph(edges);
    const nodes = Array.from(graph.nodes);

    const degreeCentrality = this.calculateDegree(graph);
    const betweennessCentrality = this.calculateBetweenness(graph);
    const closenessCentrality = this.calculateCloseness(graph);
    const eigenvectorCentrality = this.calculateEigenvector(graph);

    const scores = new Map<string, CentralityScores>();

    for (const node of nodes) {
      scores.set(node, {
        nodeId: node,
        degree: degreeCentrality.get(node) || 0,
        betweenness: betweennessCentrality.get(node) || 0,
        closeness: closenessCentrality.get(node) || 0,
        eigenvector: eigenvectorCentrality.get(node) || 0
      });
    }

    const rankings = {
      byDegree: this.rankBy(degreeCentrality),
      byBetweenness: this.rankBy(betweennessCentrality),
      byCloseness: this.rankBy(closenessCentrality),
      byEigenvector: this.rankBy(eigenvectorCentrality)
    };

    return { scores, rankings };
  }

  /**
   * Degree Centrality - number of connections
   * Normalized by (V-1)
   */
  calculateDegree(graph: any): Map<string, number> {
    const centrality = new Map<string, number>();
    const n = graph.nodes.size - 1;

    for (const node of graph.nodes) {
      const neighbors = graph.adjacency.get(node) || new Map();
      const degree = neighbors.size;
      centrality.set(node, n > 0 ? degree / n : 0);
    }

    return centrality;
  }

  /**
   * Weighted Degree Centrality - sum of edge weights
   */
  calculateWeightedDegree(graph: any): Map<string, number> {
    const centrality = new Map<string, number>();

    for (const node of graph.nodes) {
      const neighbors = graph.adjacency.get(node) || new Map();
      const weightedDegree = Array.from(neighbors.values()).reduce(
        (sum, weight) => sum + weight,
        0
      );
      centrality.set(node, weightedDegree);
    }

    return centrality;
  }

  /**
   * Betweenness Centrality - frequency of node on shortest paths
   * Uses Brandes' algorithm for efficiency
   */
  calculateBetweenness(graph: any): Map<string, number> {
    const centrality = new Map<string, number>();
    const nodes = Array.from(graph.nodes);

    for (const node of nodes) {
      centrality.set(node, 0);
    }

    for (const source of nodes) {
      const stack: string[] = [];
      const paths = new Map<string, string[][]>();
      const sigma = new Map<string, number>();
      const distance = new Map<string, number>();
      const delta = new Map<string, number>();

      for (const node of nodes) {
        paths.set(node, []);
        sigma.set(node, 0);
        distance.set(node, -1);
        delta.set(node, 0);
      }

      sigma.set(source, 1);
      distance.set(source, 0);

      const queue = [source];

      while (queue.length > 0) {
        const v = queue.shift()!;
        stack.push(v);

        const neighbors = graph.adjacency.get(v) || new Map();
        for (const w of neighbors.keys()) {
          if (distance.get(w)! < 0) {
            queue.push(w);
            distance.set(w, distance.get(v)! + 1);
          }

          if (distance.get(w) === distance.get(v)! + 1) {
            sigma.set(w, sigma.get(w)! + sigma.get(v)!);
            paths.get(w)!.push(...paths.get(v)!, [v]);
          }
        }
      }

      while (stack.length > 0) {
        const w = stack.pop()!;
        const predecessors = paths.get(w)!;

        for (const v of predecessors) {
          const contribution =
            (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!);
          delta.set(v, delta.get(v)! + contribution);
        }

        if (w !== source) {
          centrality.set(w, centrality.get(w)! + delta.get(w)!);
        }
      }
    }

    // Normalize
    const n = nodes.length;
    const normalizer = n > 2 ? (n - 1) * (n - 2) : 1;

    for (const [node, value] of centrality.entries()) {
      centrality.set(node, value / normalizer);
    }

    return centrality;
  }

  /**
   * Closeness Centrality - inverse of average distance to all other nodes
   */
  calculateCloseness(graph: any): Map<string, number> {
    const centrality = new Map<string, number>();
    const nodes = Array.from(graph.nodes);

    for (const node of nodes) {
      const distances = this.bfsDistances(node, graph);
      const reachable = Array.from(distances.values()).filter(d => d > 0 && d < Infinity);

      if (reachable.length === 0) {
        centrality.set(node, 0);
      } else {
        const avgDistance = reachable.reduce((a, b) => a + b, 0) / reachable.length;
        centrality.set(node, 1 / avgDistance);
      }
    }

    return centrality;
  }

  /**
   * Harmonic Centrality - sum of inverse distances
   * Better than closeness for disconnected graphs
   */
  calculateHarmonic(graph: any): Map<string, number> {
    const centrality = new Map<string, number>();
    const nodes = Array.from(graph.nodes);
    const n = nodes.length - 1;

    for (const node of nodes) {
      const distances = this.bfsDistances(node, graph);
      let harmonicSum = 0;

      for (const [other, distance] of distances.entries()) {
        if (other !== node && distance > 0 && distance < Infinity) {
          harmonicSum += 1 / distance;
        }
      }

      centrality.set(node, n > 0 ? harmonicSum / n : 0);
    }

    return centrality;
  }

  /**
   * Eigenvector Centrality - influence based on neighbor importance
   * Uses power iteration method
   */
  calculateEigenvector(
    graph: any,
    maxIterations: number = 100,
    tolerance: number = 1e-6
  ): Map<string, number> {
    const nodes = Array.from(graph.nodes);
    const n = nodes.length;

    // Initialize with uniform values
    let centrality = new Map<string, number>();
    for (const node of nodes) {
      centrality.set(node, 1 / n);
    }

    // Power iteration
    for (let iter = 0; iter < maxIterations; iter++) {
      const newCentrality = new Map<string, number>();
      let maxDiff = 0;

      for (const node of nodes) {
        let sum = 0;
        const neighbors = graph.adjacency.get(node) || new Map();

        for (const [neighbor, weight] of neighbors.entries()) {
          sum += centrality.get(neighbor)! * weight;
        }

        newCentrality.set(node, sum);
      }

      // Normalize
      const norm = Math.sqrt(
        Array.from(newCentrality.values()).reduce((a, b) => a + b * b, 0)
      );

      for (const [node, value] of newCentrality.entries()) {
        const normalized = value / norm;
        newCentrality.set(node, normalized);
        maxDiff = Math.max(maxDiff, Math.abs(normalized - centrality.get(node)!));
      }

      centrality = newCentrality;

      if (maxDiff < tolerance) {
        break;
      }
    }

    return centrality;
  }

  /**
   * Katz Centrality - eigenvector centrality with damping
   * Better for directed graphs
   */
  calculateKatz(
    graph: any,
    alpha: number = 0.1,
    beta: number = 1.0,
    maxIterations: number = 100
  ): Map<string, number> {
    const nodes = Array.from(graph.nodes);
    let centrality = new Map<string, number>();

    for (const node of nodes) {
      centrality.set(node, beta);
    }

    for (let iter = 0; iter < maxIterations; iter++) {
      const newCentrality = new Map<string, number>();

      for (const node of nodes) {
        let sum = beta;
        const neighbors = graph.adjacency.get(node) || new Map();

        for (const neighbor of neighbors.keys()) {
          sum += alpha * centrality.get(neighbor)!;
        }

        newCentrality.set(node, sum);
      }

      centrality = newCentrality;
    }

    return centrality;
  }

  private buildGraph(edges: Array<{ from: string; to: string; weight?: number }>) {
    const adjacency = new Map<string, Map<string, number>>();
    const nodes = new Set<string>();

    for (const edge of edges) {
      const weight = edge.weight || 1;
      nodes.add(edge.from);
      nodes.add(edge.to);

      if (!adjacency.has(edge.from)) {
        adjacency.set(edge.from, new Map());
      }
      if (!adjacency.has(edge.to)) {
        adjacency.set(edge.to, new Map());
      }

      adjacency.get(edge.from)!.set(edge.to, weight);
      adjacency.get(edge.to)!.set(edge.from, weight);
    }

    return { adjacency, nodes };
  }

  private bfsDistances(source: string, graph: any): Map<string, number> {
    const distances = new Map<string, number>();
    const queue = [source];

    for (const node of graph.nodes) {
      distances.set(node, Infinity);
    }
    distances.set(source, 0);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = distances.get(current)!;

      const neighbors = graph.adjacency.get(current) || new Map();
      for (const neighbor of neighbors.keys()) {
        if (distances.get(neighbor) === Infinity) {
          distances.set(neighbor, currentDist + 1);
          queue.push(neighbor);
        }
      }
    }

    return distances;
  }

  private rankBy(scores: Map<string, number>): Array<{ nodeId: string; score: number }> {
    return Array.from(scores.entries())
      .map(([nodeId, score]) => ({ nodeId, score }))
      .sort((a, b) => b.score - a.score);
  }
}
