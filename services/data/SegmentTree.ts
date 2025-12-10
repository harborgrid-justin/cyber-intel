
export class SegmentTree {
  private tree: Int32Array;
  private n: number;

  constructor(data: number[]) {
    this.n = data.length;
    this.tree = new Int32Array(4 * this.n);
    this.build(data, 1, 0, this.n - 1);
  }

  private build(data: number[], node: number, start: number, end: number) {
    if (start === end) {
      this.tree[node] = data[start];
    } else {
      const mid = Math.floor((start + end) / 2);
      this.build(data, 2 * node, start, mid);
      this.build(data, 2 * node + 1, mid + 1, end);
      this.tree[node] = Math.max(this.tree[2 * node], this.tree[2 * node + 1]);
    }
  }

  query(l: number, r: number): number {
    return this._query(1, 0, this.n - 1, l, r);
  }

  private _query(node: number, start: number, end: number, l: number, r: number): number {
    if (r < start || end < l) return -Infinity;
    if (l <= start && end <= r) return this.tree[node];
    
    const mid = Math.floor((start + end) / 2);
    const p1 = this._query(2 * node, start, mid, l, r);
    const p2 = this._query(2 * node + 1, mid + 1, end, l, r);
    return Math.max(p1, p2);
  }
}
