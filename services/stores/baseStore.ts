
import { DatabaseAdapter } from '../dbAdapter';
import { ScratchPad } from '../scratchPad';
import { DataMapper, IdentityMapper } from '../dataMapper';
import { fastDeepEqual } from '../utils/fastDeepEqual';
import { Result, ok, fail, AppError } from '../../types/result';
import { SystemGuard } from '../core/SystemGuard';

export class BaseStore<T extends { id: string }> {
  protected items: T[] = [];
  private debounceTimer: any = null;
  private _cache: T[] | null = null; 

  constructor(
    protected key: string, 
    protected initialData: T[], 
    protected adapter: DatabaseAdapter, 
    protected mapper: DataMapper<T> = new IdentityMapper<T>()
  ) {
    this.items = ScratchPad.load(key) || initialData;
    this._cache = this.items; 
    
    const depCheck = SystemGuard.registerDependency(key, 'DatabaseAdapter');
    if (!depCheck.success) {
        console.error((depCheck as any).error);
    }
  }

  getAll(): Result<T[]> {
    const memCheck = SystemGuard.checkMemoryHealth();
    if (!memCheck.success) {
        console.warn('Memory Pressure:', (memCheck as any).error);
        this._cache = null; // Force GC eligibility if possible
    }

    if (!this._cache) this._cache = [...this.items];
    return ok(this._cache);
  }
  
  getById(id: string): Result<T | undefined> {
    return ok(this.items.find(i => i.id === id)); 
  }

  async fetch(): Promise<Result<void>> {
    try {
      const raw = await this.adapter.query(this.key);
      if (raw && Array.isArray(raw)) {
        const newItems = raw.map(item => this.mapper.toDomain(item));
        if (!fastDeepEqual(this.items, newItems)) {
            this.items = newItems;
            this._cache = null; 
            this.notify();
        }
        return ok(undefined);
      }
      return fail(new AppError('Invalid data format received', 'VALIDATION'));
    } catch (e) {
      // Fallback to initial data on critical failure
      if (this.items.length === 0) {
        this.items = [...this.initialData];
        this._cache = null;
        this.notify();
      }
      return fail(new AppError('Fetch Failed', 'NETWORK', { originalError: e }));
    }
  }

  // ... (Other methods would follow similar Result pattern)

  add(item: T): void {
    this.items.unshift(item);
    this._cache = null;
    this.sync('CREATE', item);
  }

  update(item: T): void {
    let changed = false;
    this.items = this.items.map(i => {
        if (i.id === item.id) {
            if (!fastDeepEqual(i, item)) {
                changed = true;
                return item;
            }
        }
        return i;
    });
    
    if (changed) {
        this._cache = null; 
        this.sync('UPDATE', item);
    }
  }

  delete(id: string): void {
    const len = this.items.length;
    this.items = this.items.filter(i => i.id !== id);
    if (this.items.length !== len) {
        this._cache = null; 
        this.sync('DELETE', { id });
    }
  }

  protected sync(action: 'CREATE' | 'UPDATE' | 'DELETE', data: any) {
    const persistenceData = action === 'DELETE' ? data : this.mapper.toPersistence(data);
    try {
        this.adapter.execute(action, this.key.toLowerCase(), persistenceData);
    } catch (e) {
        console.error(`[Store] Sync failed for ${this.key}`, e);
    }
    
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
        ScratchPad.save(this.key, this.items);
        this.notify();
    }, 250);
  }

  protected notify() {
    window.dispatchEvent(new Event('data-update'));
  }
}
