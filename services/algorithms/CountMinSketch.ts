
export class CountMinSketch {
  private width: number;
  private depth: number;
  private table: Int32Array[];
  private seeds: number[];

  constructor(epsilon = 0.01, delta = 0.01) {
    this.width = Math.ceil(Math.E / epsilon);
    this.depth = Math.ceil(Math.log(1 / delta));
    this.table = Array(this.depth).fill(0).map(() => new Int32Array(this.width));
    this.seeds = Array(this.depth).fill(0).map(() => Math.floor(Math.random() * 1000));
  }

  add(item: string) {
    for (let i = 0; i < this.depth; i++) {
      const idx = this.hash(item, this.seeds[i]) % this.width;
      this.table[i][idx]++;
    }
  }

  estimate(item: string): number {
    let min = Infinity;
    for (let i = 0; i < this.depth; i++) {
      const idx = this.hash(item, this.seeds[i]) % this.width;
      min = Math.min(min, this.table[i][idx]);
    }
    return min;
  }

  private hash(str: string, seed: number): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return Math.abs(h + seed * 0x5bd1e995);
  }
}
