
interface Node { id: string; type: string; data: any; }
interface Edge { source: string; target: string; type: string; }

export class GraphDatabase {
  private nodes: Map<string, Node> = new Map();
  private edges: Edge[] = [];
  private adjacency: Map<string, string[]> = new Map();

  addNode(node: Node) {
    this.nodes.set(node.id, node);
    if (!this.adjacency.has(node.id)) this.adjacency.set(node.id, []);
  }

  addEdge(source: string, target: string, type: string) {
    this.edges.push({ source, target, type });
    if (this.nodes.has(source) && this.nodes.has(target)) {
      this.adjacency.get(source)!.push(target);
    }
  }

  bfs(startId: string, maxDepth = 3): string[] {
    const visited = new Set<string>();
    const queue: { id: string; depth: number }[] = [{ id: startId, depth: 0 }];
    const result: string[] = [];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (depth > maxDepth) continue;
      if (visited.has(id)) continue;

      visited.add(id);
      result.push(id);

      const neighbors = this.adjacency.get(id) || [];
      neighbors.forEach(n => queue.push({ id: n, depth: depth + 1 }));
    }
    return result;
  }
}
