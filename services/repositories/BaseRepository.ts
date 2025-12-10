
export interface IRepository<T> {
  findAll(filter?: Partial<T>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

// In-Memory Implementation
export class InMemoryRepository<T extends { id: string }> implements IRepository<T> {
  private data: Map<string, T> = new Map();

  constructor(initialData: T[] = []) {
    initialData.forEach(i => this.data.set(i.id, i));
  }

  async findAll(filter?: Partial<T>): Promise<T[]> {
    const all = Array.from(this.data.values());
    if (!filter) return all;
    
    return all.filter(item => 
        Object.entries(filter).every(([k, v]) => (item as any)[k] === v)
    );
  }

  async findById(id: string): Promise<T | null> {
    return this.data.get(id) || null;
  }

  async create(item: T): Promise<T> {
    this.data.set(item.id, item);
    return item;
  }

  async update(id: string, partial: Partial<T>): Promise<boolean> {
    const existing = this.data.get(id);
    if (!existing) return false;
    this.data.set(id, { ...existing, ...partial });
    return true;
  }

  async delete(id: string): Promise<boolean> {
    return this.data.delete(id);
  }
}
