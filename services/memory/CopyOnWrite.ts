
export class CoW<T> {
  private inner: T;
  private isShared: boolean = true;

  constructor(data: T) {
    this.inner = data;
  }

  read(): T {
    return this.inner;
  }

  write(): T {
    if (this.isShared) {
      // Deep clone (expensive, hence CoW)
      this.inner = JSON.parse(JSON.stringify(this.inner));
      this.isShared = false;
    }
    return this.inner;
  }

  fork(): CoW<T> {
    this.isShared = true;
    return new CoW(this.inner);
  }
}
