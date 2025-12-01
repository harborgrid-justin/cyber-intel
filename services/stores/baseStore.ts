
import { DatabaseAdapter } from '../dbAdapter';
import { ScratchPad } from '../scratchPad';

export class BaseStore<T extends { id: string }> {
  protected items: T[] = [];
  protected key: string;
  protected adapter: DatabaseAdapter;
  private debounceTimer: any = null;

  constructor(key: string, initialData: T[], adapter: DatabaseAdapter) {
    this.key = key;
    this.adapter = adapter;
    this.items = ScratchPad.load(key) || initialData;
  }

  getAll(): T[] { return [...this.items]; }
  
  getById(id: string): T | undefined { 
    return this.items.find(i => i.id === id); 
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
    this.adapter.execute(action, this.key.toLowerCase(), data);
    
    // Enterprise Performance: Debounce expensive serialization
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
        ScratchPad.save(this.key, this.items);
        window.dispatchEvent(new Event('data-update'));
    }, 250);
  }

  setAdapter(adapter: DatabaseAdapter) {
    this.adapter = adapter;
  }
}
