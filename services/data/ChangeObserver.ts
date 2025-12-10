
type ChangeType = 'CREATE' | 'UPDATE' | 'DELETE';
type Listener = (type: ChangeType, entity: any) => void;

export class ChangeObserver {
  private static listeners: Map<string, Listener[]> = new Map();

  static subscribe(collection: string, callback: Listener): () => void {
    if (!this.listeners.has(collection)) {
      this.listeners.set(collection, []);
    }
    this.listeners.get(collection)!.push(callback);
    
    return () => {
      const list = this.listeners.get(collection) || [];
      this.listeners.set(collection, list.filter(l => l !== callback));
    };
  }

  static publish(collection: string, type: ChangeType, entity: any): void {
    const list = this.listeners.get(collection);
    if (list) {
      list.forEach(fn => fn(type, entity));
    }
    // Global wildcard listener
    const globalList = this.listeners.get('*');
    if (globalList) {
        globalList.forEach(fn => fn(type, { collection, ...entity }));
    }
  }
}
