
type Filter<T> = (item: T) => boolean;

export class MicroORM<T extends { id: string }> {
  private store: Map<string, T> = new Map();

  save(entity: T): void {
    this.store.set(entity.id, entity);
  }

  findById(id: string): T | undefined {
    return this.store.get(id);
  }

  find(predicate: Filter<T>): T[] {
    const results: T[] = [];
    for (const item of this.store.values()) {
      if (predicate(item)) results.push(item);
    }
    return results;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  count(): number {
    return this.store.size;
  }
  
  clear(): void {
      this.store.clear();
  }
}
