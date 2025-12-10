
export class IdentityMap<T> {
  private map: Map<string, T> = new Map();

  has(id: string): boolean {
    return this.map.has(id);
  }

  get(id: string): T | undefined {
    return this.map.get(id);
  }

  /**
   * Adds item if not exists, or returns existing to enforce singleton reference.
   */
  register(id: string, item: T): T {
    if (this.map.has(id)) {
      return this.map.get(id)!;
    }
    this.map.set(id, item);
    return item;
  }

  clear() {
    this.map.clear();
  }
}
