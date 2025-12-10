
interface DAGNode {
  hash: string;
  data?: any;
  links: string[]; // Hashes of children
}

export class MerkleDAG {
  private store: Map<string, DAGNode> = new Map();

  async put(data: any, links: string[] = []): Promise<string> {
    const content = JSON.stringify({ data, links });
    const hash = await this.computeHash(content);
    
    this.store.set(hash, { hash, data, links });
    return hash;
  }

  get(hash: string): DAGNode | undefined {
    return this.store.get(hash);
  }

  // Verify integrity recursively
  async verify(hash: string): Promise<boolean> {
    const node = this.store.get(hash);
    if (!node) return false;

    const content = JSON.stringify({ data: node.data, links: node.links });
    const computed = await this.computeHash(content);
    if (computed !== hash) return false;

    for (const link of node.links) {
      if (!(await this.verify(link))) return false;
    }
    return true;
  }

  private async computeHash(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
