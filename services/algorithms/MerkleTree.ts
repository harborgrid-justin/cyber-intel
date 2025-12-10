
import { SimHash } from './SimHash'; // Reusing existing hash logic via SimHash or internal

export class MerkleTree {
  root: string = '';
  leaves: string[];
  levels: string[][] = [];

  constructor(data: string[]) {
    this.leaves = data.map(d => this.hash(d));
    this.build();
  }

  private build() {
    this.levels = [this.leaves];
    let current = this.leaves;
    
    while (current.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < current.length; i += 2) {
        const left = current[i];
        const right = i + 1 < current.length ? current[i + 1] : left;
        nextLevel.push(this.hash(left + right));
      }
      this.levels.push(nextLevel);
      current = nextLevel;
    }
    this.root = current.length ? current[0] : '';
  }

  getRoot(): string {
    return this.root;
  }

  // Simple string hash for demo (in prod use SHA-256 via Web Crypto)
  private hash(val: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < val.length; i++) {
      h ^= val.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16);
  }
}
