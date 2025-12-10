
class RefCounted<T> {
  constructor(public value: T, public refs: number = 0) {}
}

export class SharedObjectPool<T> {
  private pool: Map<string, RefCounted<T>> = new Map();
  private factory: (key: string) => T;
  private disposer: (item: T) => void;

  constructor(factory: (key: string) => T, disposer: (item: T) => void) {
    this.factory = factory;
    this.disposer = disposer;
  }

  acquire(key: string): T {
    let item = this.pool.get(key);
    if (!item) {
      console.debug(`[Pool] Creating new instance for ${key}`);
      item = new RefCounted(this.factory(key));
      this.pool.set(key, item);
    }
    item.refs++;
    return item.value;
  }

  release(key: string): void {
    const item = this.pool.get(key);
    if (item) {
      item.refs--;
      if (item.refs <= 0) {
        console.debug(`[Pool] Disposing instance for ${key}`);
        this.disposer(item.value);
        this.pool.delete(key);
      }
    }
  }
  
  stats() {
      return Array.from(this.pool.entries()).map(([k, v]) => ({ key: k, refs: v.refs }));
  }
}
