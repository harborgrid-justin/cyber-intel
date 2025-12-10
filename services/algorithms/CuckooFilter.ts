
export class CuckooFilter {
  private buckets: number[][]; // Each bucket holds fixed entries (fingerprints)
  private bucketCount: number;
  private entriesPerBucket = 4;
  private maxKicks = 500;

  constructor(capacity: number) {
    this.bucketCount = Math.ceil(capacity / this.entriesPerBucket);
    this.buckets = Array(this.bucketCount).fill(null).map(() => []);
  }

  insert(item: string): boolean {
    const fp = this.fingerprint(item);
    const i1 = this.hash(item) % this.bucketCount;
    const i2 = (i1 ^ this.hash(fp.toString())) % this.bucketCount;

    if (this.buckets[i1].length < this.entriesPerBucket) {
      this.buckets[i1].push(fp);
      return true;
    }
    if (this.buckets[i2].length < this.entriesPerBucket) {
      this.buckets[i2].push(fp);
      return true;
    }

    // Kick out logic
    let idx = Math.random() < 0.5 ? i1 : i2;
    let currentFp = fp;

    for (let k = 0; k < this.maxKicks; k++) {
      const randPos = Math.floor(Math.random() * this.buckets[idx].length);
      const oldFp = this.buckets[idx][randPos];
      this.buckets[idx][randPos] = currentFp;
      currentFp = oldFp;
      
      idx = (idx ^ this.hash(currentFp.toString())) % this.bucketCount;
      if (this.buckets[idx].length < this.entriesPerBucket) {
        this.buckets[idx].push(currentFp);
        return true;
      }
    }
    return false; // Filter full
  }

  contains(item: string): boolean {
    const fp = this.fingerprint(item);
    const i1 = this.hash(item) % this.bucketCount;
    const i2 = (i1 ^ this.hash(fp.toString())) % this.bucketCount;
    return this.buckets[i1].includes(fp) || this.buckets[i2].includes(fp);
  }

  delete(item: string): boolean {
    const fp = this.fingerprint(item);
    const i1 = this.hash(item) % this.bucketCount;
    if (this.remove(i1, fp)) return true;
    const i2 = (i1 ^ this.hash(fp.toString())) % this.bucketCount;
    return this.remove(i2, fp);
  }

  private remove(bucketIdx: number, fp: number): boolean {
    const idx = this.buckets[bucketIdx].indexOf(fp);
    if (idx !== -1) {
      this.buckets[bucketIdx].splice(idx, 1);
      return true;
    }
    return false;
  }

  private hash(str: string): number {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
    return Math.abs(h >>> 0);
  }

  private fingerprint(str: string): number {
    // 8-bit fingerprint
    const h = this.hash(str);
    return (h % 255) + 1; // Non-zero
  }
}
