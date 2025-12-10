
export class ShardedStorage {
  private shardCount: number;
  private prefix: string;

  constructor(prefix: string, shardCount: number = 5) {
    this.prefix = prefix;
    this.shardCount = shardCount;
  }

  private getShardIndex(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % this.shardCount;
  }

  save(id: string, data: any): void {
    const shard = this.getShardIndex(id);
    const storeKey = `${this.prefix}_SHARD_${shard}`;
    
    // In a real app, this would be separate IndexedDB stores.
    // For demo, we simulate with LocalStorage keys.
    const store = this.loadShard(shard);
    store[id] = data;
    localStorage.setItem(storeKey, JSON.stringify(store));
  }

  get(id: string): any | null {
    const shard = this.getShardIndex(id);
    const store = this.loadShard(shard);
    return store[id] || null;
  }

  private loadShard(index: number): Record<string, any> {
    try {
      return JSON.parse(localStorage.getItem(`${this.prefix}_SHARD_${index}`) || '{}');
    } catch {
      return {};
    }
  }
}
