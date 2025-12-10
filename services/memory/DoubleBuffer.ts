
export class DoubleBuffer<T> {
  private bufferA: T[];
  private bufferB: T[];
  private isUsingA = true;

  constructor(size: number, initialFactory: () => T) {
    this.bufferA = Array.from({ length: size }, initialFactory);
    this.bufferB = Array.from({ length: size }, initialFactory);
  }

  getReadBuffer(): T[] {
    return this.isUsingA ? this.bufferA : this.bufferB;
  }

  getWriteBuffer(): T[] {
    return this.isUsingA ? this.bufferB : this.bufferA;
  }

  swap() {
    this.isUsingA = !this.isUsingA;
  }
}
