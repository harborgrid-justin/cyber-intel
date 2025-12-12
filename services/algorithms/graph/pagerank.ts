/**
 * PageRank Algorithm
 *
 * Time Complexity: O(V + E) per iteration, typically 10-100 iterations
 * Space Complexity: O(V)
 *
 * Use Cases:
 * - Ranking importance of threat actors in attribution graph
 * - Identifying critical infrastructure nodes
 * - Scoring IOC significance based on network position
 * - Prioritizing investigation targets
 */

export interface PageRankNode {
  id: string;
  rank: number;
  [key: string]: any;
}

export interface PageRankOptions {
  dampingFactor?: number;
  maxIterations?: number;
  convergenceThreshold?: number;
  personalization?: Map<string, number>;
}

export interface PageRankResult {
  ranks: Map<string, number>;
  iterations: number;
  converged: boolean;
  topNodes: Array<{ id: string; rank: number }>;
}

export class PageRank {
  private dampingFactor: number = 0.85;
  private maxIterations: number = 100;
  private convergenceThreshold: number = 1e-6;

  /**
   * Calculate PageRank for a graph
   *
   * @param edges - Array of edges with from/to node IDs
   * @param options - Configuration options
   * @returns PageRank scores for all nodes
   */
  calculate(
    edges: Array<{ from: string; to: string; weight?: number }>,
    options: PageRankOptions = {}
  ): PageRankResult {
    const {
      dampingFactor = 0.85,
      maxIterations = 100,
      convergenceThreshold = 1e-6,
      personalization
    } = options;

    this.dampingFactor = dampingFactor;
    this.maxIterations = maxIterations;
    this.convergenceThreshold = convergenceThreshold;

    // Build adjacency list and collect nodes
    const outgoingEdges = new Map<string, Array<{ to: string; weight: number }>>();
    const incomingEdges = new Map<string, Array<{ from: string; weight: number }>>();
    const nodes = new Set<string>();

    for (const edge of edges) {
      nodes.add(edge.from);
      nodes.add(edge.to);

      if (!outgoingEdges.has(edge.from)) {
        outgoingEdges.set(edge.from, []);
      }
      if (!incomingEdges.has(edge.to)) {
        incomingEdges.set(edge.to, []);
      }

      const weight = edge.weight || 1;
      outgoingEdges.get(edge.from)!.push({ to: edge.to, weight });
      incomingEdges.get(edge.to)!.push({ from: edge.from, weight });
    }

    // Initialize ranks
    const numNodes = nodes.size;
    const ranks = new Map<string, number>();
    const newRanks = new Map<string, number>();

    const initialRank = 1.0 / numNodes;
    for (const node of nodes) {
      ranks.set(node, initialRank);
      newRanks.set(node, 0);
    }

    // Calculate outgoing edge weights for normalization
    const outgoingWeightSum = new Map<string, number>();
    for (const [node, edges] of outgoingEdges.entries()) {
      const sum = edges.reduce((acc, edge) => acc + edge.weight, 0);
      outgoingWeightSum.set(node, sum);
    }

    // Iterative calculation
    let iterations = 0;
    let converged = false;

    for (iterations = 0; iterations < maxIterations; iterations++) {
      let diff = 0;

      for (const node of nodes) {
        let rank = 0;
        const incoming = incomingEdges.get(node) || [];

        for (const { from, weight } of incoming) {
          const fromRank = ranks.get(from) || 0;
          const outWeight = outgoingWeightSum.get(from) || 1;
          rank += (fromRank * weight) / outWeight;
        }

        // Apply damping factor
        const teleportation = personalization?.get(node) || (1.0 / numNodes);
        const newRank = (1 - dampingFactor) * teleportation + dampingFactor * rank;

        newRanks.set(node, newRank);
        diff += Math.abs(newRank - (ranks.get(node) || 0));
      }

      // Swap ranks
      for (const [node, rank] of newRanks.entries()) {
        ranks.set(node, rank);
      }

      // Check convergence
      if (diff < convergenceThreshold) {
        converged = true;
        break;
      }
    }

    // Normalize ranks to sum to 1
    const totalRank = Array.from(ranks.values()).reduce((a, b) => a + b, 0);
    for (const [node, rank] of ranks.entries()) {
      ranks.set(node, rank / totalRank);
    }

    // Get top nodes
    const topNodes = Array.from(ranks.entries())
      .map(([id, rank]) => ({ id, rank }))
      .sort((a, b) => b.rank - a.rank);

    return {
      ranks,
      iterations: iterations + 1,
      converged,
      topNodes
    };
  }

  /**
   * Personalized PageRank - biased towards specific nodes
   * Useful for finding related threats to a known actor
   */
  personalizedPageRank(
    edges: Array<{ from: string; to: string; weight?: number }>,
    seedNodes: string[],
    options: PageRankOptions = {}
  ): PageRankResult {
    // Create personalization vector
    const personalization = new Map<string, number>();
    const weight = 1.0 / seedNodes.length;

    for (const node of seedNodes) {
      personalization.set(node, weight);
    }

    return this.calculate(edges, { ...options, personalization });
  }

  /**
   * Topic-Sensitive PageRank - multiple personalization vectors
   * Useful for categorizing threats by type
   */
  topicSensitivePageRank(
    edges: Array<{ from: string; to: string; weight?: number }>,
    topics: Map<string, string[]>,
    options: PageRankOptions = {}
  ): Map<string, PageRankResult> {
    const results = new Map<string, PageRankResult>();

    for (const [topic, seedNodes] of topics.entries()) {
      const result = this.personalizedPageRank(edges, seedNodes, options);
      results.set(topic, result);
    }

    return results;
  }

  /**
   * Calculate authority and hub scores (HITS algorithm variant)
   * Authority: nodes pointed to by many good hubs
   * Hub: nodes pointing to many good authorities
   */
  calculateHITS(
    edges: Array<{ from: string; to: string }>,
    maxIterations: number = 100
  ): {
    authorities: Map<string, number>;
    hubs: Map<string, number>;
  } {
    const nodes = new Set<string>();
    const outgoing = new Map<string, Set<string>>();
    const incoming = new Map<string, Set<string>>();

    // Build graph
    for (const edge of edges) {
      nodes.add(edge.from);
      nodes.add(edge.to);

      if (!outgoing.has(edge.from)) {
        outgoing.set(edge.from, new Set());
      }
      if (!incoming.has(edge.to)) {
        incoming.set(edge.to, new Set());
      }

      outgoing.get(edge.from)!.add(edge.to);
      incoming.get(edge.to)!.add(edge.from);
    }

    // Initialize scores
    const authorities = new Map<string, number>();
    const hubs = new Map<string, number>();

    for (const node of nodes) {
      authorities.set(node, 1.0);
      hubs.set(node, 1.0);
    }

    // Iterate
    for (let i = 0; i < maxIterations; i++) {
      // Update authority scores
      const newAuthorities = new Map<string, number>();
      for (const node of nodes) {
        let score = 0;
        const incomingNodes = incoming.get(node) || new Set();
        for (const hub of incomingNodes) {
          score += hubs.get(hub) || 0;
        }
        newAuthorities.set(node, score);
      }

      // Update hub scores
      const newHubs = new Map<string, number>();
      for (const node of nodes) {
        let score = 0;
        const outgoingNodes = outgoing.get(node) || new Set();
        for (const authority of outgoingNodes) {
          score += newAuthorities.get(authority) || 0;
        }
        newHubs.set(node, score);
      }

      // Normalize
      const authNorm = Math.sqrt(
        Array.from(newAuthorities.values()).reduce((a, b) => a + b * b, 0)
      );
      const hubNorm = Math.sqrt(
        Array.from(newHubs.values()).reduce((a, b) => a + b * b, 0)
      );

      for (const [node, score] of newAuthorities.entries()) {
        authorities.set(node, score / authNorm);
      }
      for (const [node, score] of newHubs.entries()) {
        hubs.set(node, score / hubNorm);
      }
    }

    return { authorities, hubs };
  }
}
