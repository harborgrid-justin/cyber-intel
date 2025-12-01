
import { DatabaseAdapter } from '../dbAdapter';
import { ScratchPad } from '../scratchPad';
import { DataMapper, IdentityMapper } from '../dataMapper';

export class BaseStore<T extends { id: string }> {
  protected items: T[] = [];
  protected key: string;
  protected adapter: DatabaseAdapter;
  protected mapper: DataMapper<T>;
  private debounceTimer: any = null;

  constructor(key: string, initialData: T[], adapter: DatabaseAdapter, mapper?: DataMapper<T>) {
    this.key = key;
    this.adapter = adapter;
    this.mapper = mapper || new IdentityMapper<T>();
    this.items = ScratchPad.load(key) || initialData;
  }

  getAll(): T[] { return [...this.items]; }
  
  getById(id: string): T | undefined { 
    return this.items.find(i => i.id === id); 
  }

  // Pull data from the configured adapter
  async fetch(): Promise<void> {
    try {
      const raw = await this.adapter.query(this.key);
      if (raw && Array.isArray(raw)) {
        this.items = raw.map(item => this.mapper.toDomain(item));
        this.notify();
      }
    } catch (e) {
      console.error(`Store Fetch Error (${this.key}):`, e);
    }
  }

  add(item: T): void {
    this.items.unshift(item);
    this.sync('CREATE', item);
  }

  update(item: T): void {
    this.items = this.items.map(i => i.id === item.id ? item : i);
    this.sync('UPDATE', item);
  }

  delete(id: string): void {
    this.items = this.items.filter(i => i.id !== id);
    this.sync('DELETE', { id });
  }

  protected sync(action: 'CREATE' | 'UPDATE' | 'DELETE', data: any) {
    const persistenceData = action === 'DELETE' ? data : this.mapper.toPersistence(data);
    this.adapter.execute(action, this.key.toLowerCase(), persistenceData);
    
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
        ScratchPad.save(this.key, this.items);
        this.notify();
    }, 250);
  }

  setAdapter(adapter: DatabaseAdapter) {
    this.adapter = adapter;
  }

  protected notify() {
    const scope = globalThis as unknown as { dispatchEvent?: (event: any) => void; Event?: any };
    if (typeof scope?.dispatchEvent === 'function' && typeof scope?.Event === 'function') {
      scope.dispatchEvent(new scope.Event('data-update'));
    }
  }
}
