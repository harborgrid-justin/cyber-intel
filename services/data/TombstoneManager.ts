
export interface Tombstone {
  id: string;
  deletedAt: number;
  collection: string;
  __tombstone: true;
}

export class TombstoneManager {
  static isTombstone(obj: any): obj is Tombstone {
    return obj && obj.__tombstone === true;
  }

  static create(id: string, collection: string): Tombstone {
    return {
      id,
      deletedAt: Date.now(),
      collection,
      __tombstone: true
    };
  }

  static filter<T>(items: (T | Tombstone)[]): T[] {
    return items.filter(item => !this.isTombstone(item)) as T[];
  }
}
