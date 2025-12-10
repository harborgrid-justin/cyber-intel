
export class TopologicalSort {
  /**
   * Kahn's Algorithm for sorting tasks with dependencies.
   * @param nodes List of task IDs
   * @param edges Array of [dependency, dependent] pairs
   */
  static sort(nodes: string[], edges: [string, string][]): string[] {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();

    nodes.forEach(node => {
      inDegree.set(node, 0);
      graph.set(node, []);
    });

    edges.forEach(([u, v]) => {
      if (graph.has(u) && graph.has(v)) {
        graph.get(u)!.push(v);
        inDegree.set(v, (inDegree.get(v) || 0) + 1);
      }
    });

    const queue: string[] = [];
    inDegree.forEach((degree, node) => {
      if (degree === 0) queue.push(node);
    });

    const result: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      result.push(u);

      if (graph.has(u)) {
        graph.get(u)!.forEach(v => {
          inDegree.set(v, (inDegree.get(v) || 0) - 1);
          if (inDegree.get(v) === 0) queue.push(v);
        });
      }
    }

    if (result.length !== nodes.length) {
      throw new Error("Circular dependency detected in Playbook flow.");
    }

    return result;
  }
}
