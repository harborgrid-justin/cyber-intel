/**
 * Community Detection Algorithms
 *
 * Time Complexity: O(V + E) for Louvain method
 * Space Complexity: O(V + E)
 *
 * Use Cases:
 * - Clustering related threat actors into groups
 * - Identifying coordinated attack campaigns
 * - Detecting botnets and malware families
 * - Grouping similar IOCs
 */

export interface Community {
  id: number;
  nodes: Set<string>;
  size: number;
  modularity: number;
}

export interface CommunityDetectionResult {
  communities: Community[];
  nodeToCommunity: Map<string, number>;
  modularity: number;
  numCommunities: number;
}

export class CommunityDetection {
  /**
   * Louvain Method for community detection
   * Optimizes modularity through hierarchical clustering
   */
  louvain(
    edges: Array<{ from: string; to: string; weight?: number }>,
    resolution: number = 1.0
  ): CommunityDetectionResult {
    // Build graph
    const graph = this.buildGraph(edges);
    const nodes = Array.from(graph.nodes);
    const m = graph.totalWeight / 2; // Total edge weight

    // Initialize: each node in its own community
    let nodeToCommunity = new Map<string, number>();
    for (let i = 0; i < nodes.length; i++) {
      nodeToCommunity.set(nodes[i], i);
    }

    let improved = true;
    let iteration = 0;
    const maxIterations = 100;

    while (improved && iteration < maxIterations) {
      improved = false;
      iteration++;

      // For each node, try moving to neighbor communities
      for (const node of nodes) {
        const currentCommunity = nodeToCommunity.get(node)!;
        let bestCommunity = currentCommunity;
        let bestGain = 0;

        const neighbors = graph.adjacency.get(node) || new Map();
        const candidateCommunities = new Set<number>();
        candidateCommunities.add(currentCommunity);

        for (const neighbor of neighbors.keys()) {
          candidateCommunities.add(nodeToCommunity.get(neighbor)!);
        }

        for (const community of candidateCommunities) {
          if (community === currentCommunity) continue;

          const gain = this.modularityGain(
            node,
            currentCommunity,
            community,
            graph,
            nodeToCommunity,
            m,
            resolution
          );

          if (gain > bestGain) {
            bestGain = gain;
            bestCommunity = community;
          }
        }

        if (bestCommunity !== currentCommunity) {
          nodeToCommunity.set(node, bestCommunity);
          improved = true;
        }
      }
    }

    // Consolidate communities
    const communityMap = new Map<number, Set<string>>();
    for (const [node, communityId] of nodeToCommunity.entries()) {
      if (!communityMap.has(communityId)) {
        communityMap.set(communityId, new Set());
      }
      communityMap.get(communityId)!.add(node);
    }

    // Renumber communities sequentially
    const communities: Community[] = [];
    const newNodeToCommunity = new Map<string, number>();
    let communityIndex = 0;

    for (const [oldId, nodeSet] of communityMap.entries()) {
      if (nodeSet.size > 0) {
        communities.push({
          id: communityIndex,
          nodes: nodeSet,
          size: nodeSet.size,
          modularity: 0
        });

        for (const node of nodeSet) {
          newNodeToCommunity.set(node, communityIndex);
        }
        communityIndex++;
      }
    }

    const modularity = this.calculateModularity(graph, newNodeToCommunity, m);

    return {
      communities,
      nodeToCommunity: newNodeToCommunity,
      modularity,
      numCommunities: communities.length
    };
  }

  /**
   * Label Propagation Algorithm - faster but less accurate
   * Each node adopts the most common label among its neighbors
   */
  labelPropagation(
    edges: Array<{ from: string; to: string; weight?: number }>,
    maxIterations: number = 100
  ): CommunityDetectionResult {
    const graph = this.buildGraph(edges);
    const nodes = Array.from(graph.nodes);

    // Initialize: each node has unique label
    const labels = new Map<string, number>();
    for (let i = 0; i < nodes.length; i++) {
      labels.set(nodes[i], i);
    }

    // Iterate
    for (let iter = 0; iter < maxIterations; iter++) {
      let changed = false;

      // Process nodes in random order
      const shuffled = this.shuffle([...nodes]);

      for (const node of shuffled) {
        const neighbors = graph.adjacency.get(node) || new Map();
        const labelCounts = new Map<number, number>();

        // Count neighbor labels
        for (const [neighbor, weight] of neighbors.entries()) {
          const label = labels.get(neighbor)!;
          labelCounts.set(label, (labelCounts.get(label) || 0) + weight);
        }

        if (labelCounts.size === 0) continue;

        // Find most common label
        let maxCount = 0;
        let bestLabel = labels.get(node)!;

        for (const [label, count] of labelCounts.entries()) {
          if (count > maxCount) {
            maxCount = count;
            bestLabel = label;
          }
        }

        if (bestLabel !== labels.get(node)) {
          labels.set(node, bestLabel);
          changed = true;
        }
      }

      if (!changed) break;
    }

    // Build communities from labels
    const communityMap = new Map<number, Set<string>>();
    for (const [node, label] of labels.entries()) {
      if (!communityMap.has(label)) {
        communityMap.set(label, new Set());
      }
      communityMap.get(label)!.add(node);
    }

    const communities: Community[] = [];
    const nodeToCommunity = new Map<string, number>();
    let communityIndex = 0;

    for (const nodeSet of communityMap.values()) {
      communities.push({
        id: communityIndex,
        nodes: nodeSet,
        size: nodeSet.size,
        modularity: 0
      });

      for (const node of nodeSet) {
        nodeToCommunity.set(node, communityIndex);
      }
      communityIndex++;
    }

    const modularity = this.calculateModularity(
      graph,
      nodeToCommunity,
      graph.totalWeight / 2
    );

    return {
      communities,
      nodeToCommunity,
      modularity,
      numCommunities: communities.length
    };
  }

  /**
   * Girvan-Newman Algorithm - divisive hierarchical clustering
   * Removes edges with highest betweenness iteratively
   */
  girvanNewman(
    edges: Array<{ from: string; to: string; weight?: number }>,
    numCommunities: number
  ): CommunityDetectionResult {
    const graph = this.buildGraph(edges);
    const nodes = Array.from(graph.nodes);

    // Start with all nodes in one community
    const nodeToCommunity = new Map<string, number>();
    for (const node of nodes) {
      nodeToCommunity.set(node, 0);
    }

    let currentCommunities = 1;
    const edgeList = [...edges];

    while (currentCommunities < numCommunities && edgeList.length > 0) {
      // Calculate edge betweenness
      const betweenness = this.calculateEdgeBetweenness(edgeList);

      // Find edge with highest betweenness
      let maxBetweenness = 0;
      let edgeToRemove = 0;

      for (let i = 0; i < edgeList.length; i++) {
        const key = `${edgeList[i].from}-${edgeList[i].to}`;
        const bet = betweenness.get(key) || 0;
        if (bet > maxBetweenness) {
          maxBetweenness = bet;
          edgeToRemove = i;
        }
      }

      // Remove edge
      edgeList.splice(edgeToRemove, 1);

      // Recalculate connected components
      const components = this.findConnectedComponents(edgeList);
      currentCommunities = components.length;

      // Update node to community mapping
      for (let i = 0; i < components.length; i++) {
        for (const node of components[i]) {
          nodeToCommunity.set(node, i);
        }
      }
    }

    // Build final communities
    const communityMap = new Map<number, Set<string>>();
    for (const [node, communityId] of nodeToCommunity.entries()) {
      if (!communityMap.has(communityId)) {
        communityMap.set(communityId, new Set());
      }
      communityMap.get(communityId)!.add(node);
    }

    const communities: Community[] = [];
    for (const [id, nodeSet] of communityMap.entries()) {
      communities.push({
        id,
        nodes: nodeSet,
        size: nodeSet.size,
        modularity: 0
      });
    }

    const modularity = this.calculateModularity(
      graph,
      nodeToCommunity,
      graph.totalWeight / 2
    );

    return {
      communities,
      nodeToCommunity,
      modularity,
      numCommunities: communities.length
    };
  }

  private buildGraph(edges: Array<{ from: string; to: string; weight?: number }>) {
    const adjacency = new Map<string, Map<string, number>>();
    const nodes = new Set<string>();
    let totalWeight = 0;

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
      totalWeight += weight * 2; // Count both directions
    }

    return { adjacency, nodes, totalWeight };
  }

  private modularityGain(
    node: string,
    fromCommunity: number,
    toCommunity: number,
    graph: any,
    nodeToCommunity: Map<string, number>,
    m: number,
    resolution: number
  ): number {
    const neighbors = graph.adjacency.get(node) || new Map();
    let edgesTo = 0;
    let edgesFrom = 0;

    for (const [neighbor, weight] of neighbors.entries()) {
      const neighborCommunity = nodeToCommunity.get(neighbor)!;
      if (neighborCommunity === toCommunity) {
        edgesTo += weight;
      }
      if (neighborCommunity === fromCommunity) {
        edgesFrom += weight;
      }
    }

    return resolution * ((edgesTo - edgesFrom) / (2 * m));
  }

  private calculateModularity(
    graph: any,
    nodeToCommunity: Map<string, number>,
    m: number
  ): number {
    let modularity = 0;
    const nodes = Array.from(graph.nodes);

    for (const node1 of nodes) {
      const neighbors = graph.adjacency.get(node1) || new Map();
      const degree1 = Array.from(neighbors.values()).reduce((a, b) => a + b, 0);
      const community1 = nodeToCommunity.get(node1)!;

      for (const node2 of nodes) {
        const community2 = nodeToCommunity.get(node2)!;
        if (community1 !== community2) continue;

        const weight = neighbors.get(node2) || 0;
        const degree2 = Array.from(
          (graph.adjacency.get(node2) || new Map()).values()
        ).reduce((a, b) => a + b, 0);

        modularity += weight - (degree1 * degree2) / (2 * m);
      }
    }

    return modularity / (2 * m);
  }

  private calculateEdgeBetweenness(
    edges: Array<{ from: string; to: string; weight?: number }>
  ): Map<string, number> {
    const betweenness = new Map<string, number>();
    const graph = this.buildGraph(edges);
    const nodes = Array.from(graph.nodes);

    // For each pair of nodes, calculate shortest paths
    for (const source of nodes) {
      for (const target of nodes) {
        if (source === target) continue;

        const paths = this.findAllShortestPaths(source, target, graph);
        for (const path of paths) {
          for (let i = 0; i < path.length - 1; i++) {
            const key = `${path[i]}-${path[i + 1]}`;
            betweenness.set(key, (betweenness.get(key) || 0) + 1 / paths.length);
          }
        }
      }
    }

    return betweenness;
  }

  private findAllShortestPaths(
    source: string,
    target: string,
    graph: any
  ): string[][] {
    const distances = new Map<string, number>();
    const paths = new Map<string, string[][]>();

    for (const node of graph.nodes) {
      distances.set(node, Infinity);
      paths.set(node, []);
    }
    distances.set(source, 0);
    paths.set(source, [[source]]);

    const queue = [source];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = distances.get(current)!;
      const currentPaths = paths.get(current)!;

      const neighbors = graph.adjacency.get(current) || new Map();
      for (const neighbor of neighbors.keys()) {
        const newDist = currentDist + 1;

        if (newDist < distances.get(neighbor)!) {
          distances.set(neighbor, newDist);
          paths.set(
            neighbor,
            currentPaths.map(p => [...p, neighbor])
          );
          queue.push(neighbor);
        } else if (newDist === distances.get(neighbor)!) {
          const newPaths = currentPaths.map(p => [...p, neighbor]);
          paths.set(neighbor, [...paths.get(neighbor)!, ...newPaths]);
        }
      }
    }

    return paths.get(target) || [];
  }

  private findConnectedComponents(
    edges: Array<{ from: string; to: string; weight?: number }>
  ): Set<string>[] {
    const graph = this.buildGraph(edges);
    const visited = new Set<string>();
    const components: Set<string>[] = [];

    for (const node of graph.nodes) {
      if (!visited.has(node)) {
        const component = new Set<string>();
        this.dfs(node, graph.adjacency, visited, component);
        components.push(component);
      }
    }

    return components;
  }

  private dfs(
    node: string,
    adjacency: Map<string, Map<string, number>>,
    visited: Set<string>,
    component: Set<string>
  ): void {
    visited.add(node);
    component.add(node);

    const neighbors = adjacency.get(node) || new Map();
    for (const neighbor of neighbors.keys()) {
      if (!visited.has(neighbor)) {
        this.dfs(neighbor, adjacency, visited, component);
      }
    }
  }

  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
