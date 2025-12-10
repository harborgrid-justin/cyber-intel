
export class BitSet {
  private bits: Uint32Array;

  constructor(size: number) {
    this.bits = new Uint32Array(Math.ceil(size / 32));
  }

  set(index: number) {
    const i = Math.floor(index / 32);
    const mask = 1 << (index % 32);
    this.bits[i] |= mask;
  }

  clear(index: number) {
    const i = Math.floor(index / 32);
    const mask = 1 << (index % 32);
    this.bits[i] &= ~mask;
  }

  has(index: number): boolean {
    const i = Math.floor(index / 32);
    const mask = 1 << (index % 32);
    return (this.bits[i] & mask) !== 0;
  }

  toggle(index: number) {
    if (this.has(index)) this.clear(index);
    else this.set(index);
  }
}
