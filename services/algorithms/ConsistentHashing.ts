
export class ConsistentHashRing {
  private ring: Map<number, string> = new Map();
  private sortedKeys: number[] = [];
  private replicas: number;

  constructor(nodes: string[] = [], replicas = 3) {
    this.replicas = replicas;
    nodes.forEach(n => this.addNode(n));
  }

  addNode(node: string) {
    for (let i = 0; i < this.replicas; i++) {
      const key = this.hash(`${node}:${i}`);
      this.ring.set(key, node);
      this.sortedKeys.push(key);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }

  removeNode(node: string) {
    for (let i = 0; i < this.replicas; i++) {
      const key = this.hash(`${node}:${i}`);
      this.ring.delete(key);
      const idx = this.sortedKeys.indexOf(key);
      if (idx !== -1) this.sortedKeys.splice(idx, 1);
    }
  }

  getNode(key: string): string | null {
    if (this.ring.size === 0) return null;
    const hash = this.hash(key);
    const idx = this.sortedKeys.findIndex(k => k >= hash);
    // Wrap around to 0 if not found (circular ring)
    const nodeKey = this.sortedKeys[idx === -1 ? 0 : idx];
    return this.ring.get(nodeKey) || null;
  }

  private hash(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }
}
