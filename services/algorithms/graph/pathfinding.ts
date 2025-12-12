/**
 * Attack Path Enumeration Algorithms
 *
 * Time Complexity:
 * - All Paths: O(V!) worst case (exponential)
 * - Limited Depth: O(V^d) where d is max depth
 * - All Simple Paths: O(V * 2^V) with memoization
 *
 * Use Cases:
 * - Enumerating all possible attack paths
 * - Finding attack chains in kill chain analysis
 * - Lateral movement path discovery
 * - Privilege escalation route identification
 */

export interface AttackPath {
  path: string[];
  length: number;
  totalWeight: number;
  nodes: Array<{ id: string; type?: string; metadata?: any }>;
  edges: Array<{ from: string; to: string; weight: number; metadata?: any }>;
}

export interface PathConstraints {
  maxDepth?: number;
  maxPaths?: number;
  minWeight?: number;
  maxWeight?: number;
  requiredNodes?: Set<string>;
  forbiddenNodes?: Set<string>;
  nodeFilter?: (nodeId: string) => boolean;
  edgeFilter?: (from: string, to: string) => boolean;
}

export class PathFinding {
  private adjacency: Map<string, Map<string, number>>;
  private edgeMetadata: Map<string, any>;
  private nodeMetadata: Map<string, any>;

  constructor() {
    this.adjacency = new Map();
    this.edgeMetadata = new Map();
    this.nodeMetadata = new Map();
  }

  /**
   * Build graph from edges with metadata
   */
  buildGraph(
    edges: Array<{
      from: string;
      to: string;
      weight?: number;
      metadata?: any;
    }>,
    nodeMetadata?: Map<string, any>
  ): void {
    this.adjacency.clear();
    this.edgeMetadata.clear();
    this.nodeMetadata = nodeMetadata || new Map();

    for (const edge of edges) {
      if (!this.adjacency.has(edge.from)) {
        this.adjacency.set(edge.from, new Map());
      }

      const weight = edge.weight || 1;
      this.adjacency.get(edge.from)!.set(edge.to, weight);

      const edgeKey = `${edge.from}->${edge.to}`;
      if (edge.metadata) {
        this.edgeMetadata.set(edgeKey, edge.metadata);
      }
    }
  }

  /**
   * Find all simple paths from source to target
   * A simple path visits each node at most once
   */
  findAllSimplePaths(
    source: string,
    target: string,
    constraints: PathConstraints = {}
  ): AttackPath[] {
    const paths: AttackPath[] = [];
    const visited = new Set<string>();
    const currentPath: string[] = [];

    const maxDepth = constraints.maxDepth || 10;
    const maxPaths = constraints.maxPaths || 1000;

    this.dfsAllPaths(
      source,
      target,
      visited,
      currentPath,
      paths,
      0,
      maxDepth,
      maxPaths,
      constraints
    );

    return this.sortAndFilterPaths(paths, constraints);
  }

  /**
   * Find all paths of specific length
   */
  findPathsOfLength(
    source: string,
    target: string,
    length: number,
    constraints: PathConstraints = {}
  ): AttackPath[] {
    const paths: AttackPath[] = [];
    const currentPath: string[] = [];
    const visited = new Set<string>();

    this.dfsFixedLength(
      source,
      target,
      length,
      0,
      visited,
      currentPath,
      paths,
      constraints
    );

    return this.sortAndFilterPaths(paths, constraints);
  }

  /**
   * Find all attack chains (paths through required nodes)
   */
  findAttackChains(
    source: string,
    target: string,
    requiredNodes: string[],
    constraints: PathConstraints = {}
  ): AttackPath[] {
    const allPaths = this.findAllSimplePaths(source, target, constraints);
    const requiredSet = new Set(requiredNodes);

    return allPaths.filter(path => {
      const pathSet = new Set(path.path);
      for (const required of requiredSet) {
        if (!pathSet.has(required)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Find shortest paths avoiding specific nodes (blocked nodes)
   */
  findPathsAvoidingNodes(
    source: string,
    target: string,
    blockedNodes: Set<string>,
    k: number = 5
  ): AttackPath[] {
    const constraints: PathConstraints = {
      forbiddenNodes: blockedNodes,
      maxPaths: k
    };

    return this.findAllSimplePaths(source, target, constraints);
  }

  /**
   * Find all cycles (paths that return to start)
   * Useful for detecting circular dependencies or loop attacks
   */
  findAllCycles(startNode: string, maxLength: number = 10): AttackPath[] {
    const cycles: AttackPath[] = [];
    const currentPath: string[] = [];
    const visited = new Set<string>();

    this.dfsCycles(startNode, startNode, visited, currentPath, cycles, 0, maxLength);

    return cycles;
  }

  /**
   * Find bottleneck paths - paths that go through critical nodes
   */
  findBottleneckPaths(
    source: string,
    target: string,
    criticalNodes: Set<string>
  ): AttackPath[] {
    const allPaths = this.findAllSimplePaths(source, target);

    return allPaths.filter(path => {
      for (const node of path.path) {
        if (criticalNodes.has(node)) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Calculate path diversity - how different are the paths?
   */
  calculatePathDiversity(paths: AttackPath[]): number {
    if (paths.length < 2) return 0;

    let totalDifference = 0;
    let comparisons = 0;

    for (let i = 0; i < paths.length; i++) {
      for (let j = i + 1; j < paths.length; j++) {
        const set1 = new Set(paths[i].path);
        const set2 = new Set(paths[j].path);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        const jaccard = intersection.size / union.size;
        totalDifference += 1 - jaccard;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalDifference / comparisons : 0;
  }

  /**
   * Find critical nodes - nodes whose removal disconnects source and target
   */
  findCriticalNodes(source: string, target: string): Set<string> {
    const criticalNodes = new Set<string>();
    const basePaths = this.findAllSimplePaths(source, target);

    if (basePaths.length === 0) return criticalNodes;

    // Get all nodes in paths except source and target
    const nodesInPaths = new Set<string>();
    for (const path of basePaths) {
      for (const node of path.path) {
        if (node !== source && node !== target) {
          nodesInPaths.add(node);
        }
      }
    }

    // Test each node
    for (const node of nodesInPaths) {
      const pathsWithoutNode = this.findPathsAvoidingNodes(
        source,
        target,
        new Set([node]),
        1
      );

      if (pathsWithoutNode.length === 0) {
        criticalNodes.add(node);
      }
    }

    return criticalNodes;
  }

  private dfsAllPaths(
    current: string,
    target: string,
    visited: Set<string>,
    path: string[],
    paths: AttackPath[],
    depth: number,
    maxDepth: number,
    maxPaths: number,
    constraints: PathConstraints
  ): void {
    if (paths.length >= maxPaths || depth > maxDepth) {
      return;
    }

    if (constraints.forbiddenNodes?.has(current)) {
      return;
    }

    if (constraints.nodeFilter && !constraints.nodeFilter(current)) {
      return;
    }

    visited.add(current);
    path.push(current);

    if (current === target && path.length > 1) {
      const attackPath = this.buildAttackPath(path);
      if (this.meetsConstraints(attackPath, constraints)) {
        paths.push(attackPath);
      }
    } else {
      const neighbors = this.adjacency.get(current) || new Map();

      for (const [neighbor, weight] of neighbors.entries()) {
        if (!visited.has(neighbor)) {
          if (!constraints.edgeFilter || constraints.edgeFilter(current, neighbor)) {
            this.dfsAllPaths(
              neighbor,
              target,
              visited,
              path,
              paths,
              depth + 1,
              maxDepth,
              maxPaths,
              constraints
            );
          }
        }
      }
    }

    visited.delete(current);
    path.pop();
  }

  private dfsFixedLength(
    current: string,
    target: string,
    targetLength: number,
    currentLength: number,
    visited: Set<string>,
    path: string[],
    paths: AttackPath[],
    constraints: PathConstraints
  ): void {
    if (currentLength > targetLength) return;

    visited.add(current);
    path.push(current);

    if (current === target && currentLength === targetLength) {
      const attackPath = this.buildAttackPath(path);
      if (this.meetsConstraints(attackPath, constraints)) {
        paths.push(attackPath);
      }
    } else if (currentLength < targetLength) {
      const neighbors = this.adjacency.get(current) || new Map();

      for (const neighbor of neighbors.keys()) {
        if (!visited.has(neighbor)) {
          this.dfsFixedLength(
            neighbor,
            target,
            targetLength,
            currentLength + 1,
            visited,
            path,
            paths,
            constraints
          );
        }
      }
    }

    visited.delete(current);
    path.pop();
  }

  private dfsCycles(
    current: string,
    start: string,
    visited: Set<string>,
    path: string[],
    cycles: AttackPath[],
    depth: number,
    maxLength: number
  ): void {
    if (depth > maxLength) return;

    path.push(current);

    if (current === start && path.length > 1) {
      cycles.push(this.buildAttackPath(path));
    } else {
      visited.add(current);
      const neighbors = this.adjacency.get(current) || new Map();

      for (const neighbor of neighbors.keys()) {
        if (!visited.has(neighbor) || (neighbor === start && path.length > 1)) {
          this.dfsCycles(neighbor, start, visited, path, cycles, depth + 1, maxLength);
        }
      }
      visited.delete(current);
    }

    path.pop();
  }

  private buildAttackPath(path: string[]): AttackPath {
    let totalWeight = 0;
    const nodes = [];
    const edges = [];

    for (let i = 0; i < path.length; i++) {
      const nodeId = path[i];
      nodes.push({
        id: nodeId,
        metadata: this.nodeMetadata.get(nodeId)
      });

      if (i < path.length - 1) {
        const nextNode = path[i + 1];
        const weight = this.adjacency.get(nodeId)?.get(nextNode) || 1;
        totalWeight += weight;

        const edgeKey = `${nodeId}->${nextNode}`;
        edges.push({
          from: nodeId,
          to: nextNode,
          weight,
          metadata: this.edgeMetadata.get(edgeKey)
        });
      }
    }

    return {
      path,
      length: path.length - 1,
      totalWeight,
      nodes,
      edges
    };
  }

  private meetsConstraints(path: AttackPath, constraints: PathConstraints): boolean {
    if (constraints.minWeight !== undefined && path.totalWeight < constraints.minWeight) {
      return false;
    }

    if (constraints.maxWeight !== undefined && path.totalWeight > constraints.maxWeight) {
      return false;
    }

    if (constraints.requiredNodes) {
      const pathSet = new Set(path.path);
      for (const required of constraints.requiredNodes) {
        if (!pathSet.has(required)) {
          return false;
        }
      }
    }

    return true;
  }

  private sortAndFilterPaths(
    paths: AttackPath[],
    constraints: PathConstraints
  ): AttackPath[] {
    // Sort by total weight (prefer lower weight = shorter/cheaper paths)
    paths.sort((a, b) => a.totalWeight - b.totalWeight);

    if (constraints.maxPaths && paths.length > constraints.maxPaths) {
      return paths.slice(0, constraints.maxPaths);
    }

    return paths;
  }
}
