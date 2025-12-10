
export class FenwickTree {
  private tree: Int32Array;

  constructor(size: number) {
    this.tree = new Int32Array(size + 1);
  }

  // Adds delta to element at index i (0-based)
  update(i: number, delta: number) {
    i++; // Convert 0-based to 1-based
    while (i < this.tree.length) {
      this.tree[i] += delta;
      i += i & (-i);
    }
  }

  // Returns sum from 0 to i (0-based)
  query(i: number): number {
    i++;
    let sum = 0;
    while (i > 0) {
      sum += this.tree[i];
      i -= i & (-i);
    }
    return sum;
  }

  // Returns sum in range [l, r]
  rangeQuery(l: number, r: number): number {
    return this.query(r) - this.query(l - 1);
  }
}
