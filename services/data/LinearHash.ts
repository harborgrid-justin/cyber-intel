
export class LinearHash<T> {
  private items: Map<number, T>[] = [new Map()];
  private p = 0; // Split pointer
  private level = 0;
  private bucketSize = 4;
  private count = 0;

  put(key: number, value: T) {
    const bucketIdx = this.getBucketIndex(key);
    this.items[bucketIdx].set(key, value);
    this.count++;
    
    if (this.loadFactor() > 0.75) {
      this.split();
    }
  }

  get(key: number): T | undefined {
    return this.items[this.getBucketIndex(key)].get(key);
  }

  private getBucketIndex(key: number): number {
    let idx = key % (1 << this.level) * this.items.length; // Simplified hash
    // Real implementation would use modulo N * 2^L
    idx = key % (this.items.length); // Fallback for simplicity in demo
    if (idx < this.p) {
        idx = key % (this.items.length * 2);
    }
    return idx % this.items.length;
  }

  private split() {
    this.items.push(new Map());
    // Rehash bucket at p
    const oldBucket = this.items[this.p];
    this.items[this.p] = new Map();
    
    for (const [k, v] of oldBucket) {
        const newIdx = k % (this.items.length); // Re-distribute
        this.items[newIdx].set(k, v);
    }

    this.p++;
    if (this.p === (1 << this.level)) {
        this.p = 0;
        this.level++;
    }
  }

  private loadFactor() {
    return this.count / (this.items.length * this.bucketSize);
  }
}
