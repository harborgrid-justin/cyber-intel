
export class BloomFilter {
  private size: number;
  private hashes: number;
  private bitArray: Uint8Array;

  constructor(expectedItems: number, falsePositiveRate: number) {
    this.size = Math.ceil(-1 * (expectedItems * Math.log(falsePositiveRate)) / Math.pow(Math.log(2), 2));
    this.hashes = Math.ceil((this.size / expectedItems) * Math.log(2));
    this.bitArray = new Uint8Array(Math.ceil(this.size / 8));
  }

  add(item: string): void {
    for (let i = 0; i < this.hashes; i++) {
      const pos = this.hash(item, i) % this.size;
      this.bitArray[Math.floor(pos / 8)] |= (1 << (pos % 8));
    }
  }

  test(item: string): boolean {
    for (let i = 0; i < this.hashes; i++) {
      const pos = this.hash(item, i) % this.size;
      if (!(this.bitArray[Math.floor(pos / 8)] & (1 << (pos % 8)))) {
        return false;
      }
    }
    return true;
  }

  private hash(item: string, seed: number): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < item.length; i++) {
      h ^= item.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return Math.abs(h + seed * 0x5bd1e995); // FNV-1a variant
  }
}
