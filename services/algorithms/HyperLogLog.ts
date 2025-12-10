
// Simplified HyperLogLog for unique threat actor estimation
export class CardinalityEstimator {
  private buckets: Int8Array;
  private m: number;

  constructor(b: number = 10) { // b bits for bucketing (2^b buckets)
    this.m = 1 << b;
    this.buckets = new Int8Array(this.m);
  }

  add(value: string): void {
    const x = this.fnv1a(value);
    const j = x & (this.m - 1); // Bucket index
    const w = x >>> 10; // Remaining bits
    this.buckets[j] = Math.max(this.buckets[j], this.rho(w));
  }

  count(): number {
    const alphaMM = 0.7213 / (1 + 1.079 / this.m);
    let z = 0;
    for (let i = 0; i < this.m; i++) {
      z += Math.pow(2, -this.buckets[i]);
    }
    const E = (alphaMM * this.m * this.m) / z;
    return Math.round(E); // Raw estimate
  }

  private rho(w: number): number {
    // Count leading zeros + 1
    return Math.clz32(w) + 1;
  }

  private fnv1a(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }
}
