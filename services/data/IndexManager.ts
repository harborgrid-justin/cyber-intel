
export class IndexManager<T> {
  private indices: Map<keyof T, Map<string, string[]>> = new Map();

  createIndex(field: keyof T) {
    this.indices.set(field, new Map());
  }

  indexItem(item: T & { id: string }) {
    this.indices.forEach((map, field) => {
      const val = String(item[field]);
      if (!map.has(val)) map.set(val, []);
      map.get(val)!.push(item.id);
    });
  }

  lookup(field: keyof T, value: string): string[] {
    const map = this.indices.get(field);
    return map ? (map.get(value) || []) : [];
  }
}
