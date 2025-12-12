/**
 * Dijkstra's Shortest Path Algorithm
 *
 * Time Complexity: O((V + E) log V) with binary heap
 * Space Complexity: O(V)
 *
 * Use Cases:
 * - Finding shortest attack paths in threat graphs
 * - Determining minimum cost routes for lateral movement
 * - Calculating fastest propagation paths for malware
 * - Network routing optimization
 */

export interface GraphNode {
  id: string;
  [key: string]: any;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  [key: string]: any;
}

export interface ShortestPathResult {
  distance: number;
  path: string[];
  cost: number;
}

export class Dijkstra {
  private adjacencyList: Map<string, Map<string, number>>;

  constructor() {
    this.adjacencyList = new Map();
  }

  /**
   * Add an edge to the graph
   */
  addEdge(from: string, to: string, weight: number): void {
    if (!this.adjacencyList.has(from)) {
      this.adjacencyList.set(from, new Map());
    }
    this.adjacencyList.get(from)!.set(to, weight);
  }

  /**
   * Build graph from edge list
   */
  buildGraph(edges: GraphEdge[]): void {
    this.adjacencyList.clear();
    for (const edge of edges) {
      this.addEdge(edge.from, edge.to, edge.weight);
    }
  }

  /**
   * Find shortest path from source to target
   * Returns path, distance, and total cost
   */
  findShortestPath(source: string, target: string): ShortestPathResult | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const visited = new Set<string>();
    const pq = new MinPriorityQueue<string>();

    // Initialize distances
    for (const node of this.adjacencyList.keys()) {
      distances.set(node, Infinity);
      previous.set(node, null);
    }
    distances.set(source, 0);
    pq.enqueue(source, 0);

    while (!pq.isEmpty()) {
      const current = pq.dequeue()!;

      if (current === target) {
        break;
      }

      if (visited.has(current)) {
        continue;
      }
      visited.add(current);

      const neighbors = this.adjacencyList.get(current);
      if (!neighbors) continue;

      for (const [neighbor, weight] of neighbors.entries()) {
        const distance = distances.get(current)! + weight;

        if (distance < distances.get(neighbor)!) {
          distances.set(neighbor, distance);
          previous.set(neighbor, current);
          pq.enqueue(neighbor, distance);
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current: string | null = target;

    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) || null;
    }

    if (path[0] !== source) {
      return null; // No path found
    }

    return {
      distance: distances.get(target) || Infinity,
      path,
      cost: distances.get(target) || Infinity
    };
  }

  /**
   * Find all shortest paths from source to all other nodes
   */
  findAllShortestPaths(source: string): Map<string, ShortestPathResult> {
    const results = new Map<string, ShortestPathResult>();
    const nodes = Array.from(this.adjacencyList.keys());

    for (const target of nodes) {
      if (target !== source) {
        const result = this.findShortestPath(source, target);
        if (result) {
          results.set(target, result);
        }
      }
    }

    return results;
  }

  /**
   * Find K shortest paths from source to target
   * Uses Yen's algorithm
   */
  findKShortestPaths(source: string, target: string, k: number): ShortestPathResult[] {
    const results: ShortestPathResult[] = [];
    const firstPath = this.findShortestPath(source, target);

    if (!firstPath) {
      return results;
    }

    results.push(firstPath);
    const candidates: ShortestPathResult[] = [];

    for (let i = 1; i < k; i++) {
      const prevPath = results[i - 1].path;

      for (let j = 0; j < prevPath.length - 1; j++) {
        const spurNode = prevPath[j];
        const rootPath = prevPath.slice(0, j + 1);

        // Store and remove edges
        const removedEdges = new Map<string, Map<string, number>>();

        // Remove edges in previous paths that share root path
        for (const result of results) {
          if (this.pathsShareRoot(result.path, rootPath)) {
            const from = result.path[j];
            const to = result.path[j + 1];
            if (!removedEdges.has(from)) {
              removedEdges.set(from, new Map());
            }
            const weight = this.adjacencyList.get(from)?.get(to);
            if (weight !== undefined) {
              removedEdges.get(from)!.set(to, weight);
              this.adjacencyList.get(from)?.delete(to);
            }
          }
        }

        // Find spur path
        const spurPath = this.findShortestPath(spurNode, target);

        // Restore edges
        for (const [from, edges] of removedEdges.entries()) {
          for (const [to, weight] of edges.entries()) {
            this.adjacencyList.get(from)?.set(to, weight);
          }
        }

        if (spurPath) {
          const totalPath = [...rootPath.slice(0, -1), ...spurPath.path];
          const totalCost = this.calculatePathCost(totalPath);
          candidates.push({
            path: totalPath,
            distance: totalCost,
            cost: totalCost
          });
        }
      }

      if (candidates.length === 0) {
        break;
      }

      // Sort candidates and take the best
      candidates.sort((a, b) => a.cost - b.cost);
      const best = candidates.shift()!;
      results.push(best);
    }

    return results;
  }

  private pathsShareRoot(path: string[], root: string[]): boolean {
    if (path.length < root.length) {
      return false;
    }
    for (let i = 0; i < root.length; i++) {
      if (path[i] !== root[i]) {
        return false;
      }
    }
    return true;
  }

  private calculatePathCost(path: string[]): number {
    let cost = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const weight = this.adjacencyList.get(path[i])?.get(path[i + 1]);
      if (weight === undefined) {
        return Infinity;
      }
      cost += weight;
    }
    return cost;
  }
}

/**
 * Min Priority Queue implementation for Dijkstra
 */
class MinPriorityQueue<T> {
  private heap: Array<{ element: T; priority: number }> = [];

  enqueue(element: T, priority: number): void {
    this.heap.push({ element, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }
    if (this.heap.length === 1) {
      return this.heap.pop()!.element;
    }

    const min = this.heap[0].element;
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIndex].priority) {
        break;
      }
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < this.heap.length && this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }
      if (smallest === index) {
        break;
      }

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}
