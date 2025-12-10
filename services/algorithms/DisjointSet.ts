
export class DisjointSet {
  private parent: Map<string, string> = new Map();
  private rank: Map<string, number> = new Map();

  makeSet(id: string) {
    this.parent.set(id, id);
    this.rank.set(id, 0);
  }

  find(id: string): string {
    if (!this.parent.has(id)) this.makeSet(id);
    
    if (this.parent.get(id) !== id) {
      // Path compression
      this.parent.set(id, this.find(this.parent.get(id)!));
    }
    return this.parent.get(id)!;
  }

  union(id1: string, id2: string) {
    const root1 = this.find(id1);
    const root2 = this.find(id2);

    if (root1 !== root2) {
      const rank1 = this.rank.get(root1) || 0;
      const rank2 = this.rank.get(root2) || 0;

      if (rank1 < rank2) {
        this.parent.set(root1, root2);
      } else if (rank1 > rank2) {
        this.parent.set(root2, root1);
      } else {
        this.parent.set(root2, root1);
        this.rank.set(root1, rank1 + 1);
      }
    }
  }

  connected(id1: string, id2: string): boolean {
    return this.find(id1) === this.find(id2);
  }
}
