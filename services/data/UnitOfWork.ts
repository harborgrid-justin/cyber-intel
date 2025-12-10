
import { WriteAheadLog } from './WriteAheadLog';

export class UnitOfWork {
  private newObjects: any[] = [];
  private dirtyObjects: any[] = [];
  private deletedObjects: any[] = [];

  registerNew(obj: any) { this.newObjects.push(obj); }
  registerDirty(obj: any) { this.dirtyObjects.push(obj); }
  registerDeleted(obj: any) { this.deletedObjects.push(obj); }

  async commit(store: any) {
    console.debug('[UoW] Committing transaction...');
    
    // 1. WAL Log
    WriteAheadLog.log('INSERT', 'BATCH', this.newObjects);
    WriteAheadLog.log('UPDATE', 'BATCH', this.dirtyObjects);
    WriteAheadLog.log('DELETE', 'BATCH', this.deletedObjects);

    // 2. Perform updates
    try {
        this.newObjects.forEach(o => store.add(o));
        this.dirtyObjects.forEach(o => store.update(o));
        this.deletedObjects.forEach(o => store.delete(o.id));
        
        // 3. Clear
        this.newObjects = [];
        this.dirtyObjects = [];
        this.deletedObjects = [];
        
        console.debug('[UoW] Commit successful');
    } catch (e) {
        console.error('[UoW] Commit failed, WAL preserved for recovery');
        throw e;
    }
  }
}
