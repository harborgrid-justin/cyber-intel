
export class LsmTree {
  private memTable: Map<string, any> = new Map();
  private ssTables: Map<string, any>[] = [];
  private limit = 100;

  put(key: string, value: any) {
    this.memTable.set(key, value);
    if (this.memTable.size >= this.limit) {
      this.flush();
    }
  }

  get(key: string): any | null {
    // 1. Check MemTable
    if (this.memTable.has(key)) return this.memTable.get(key);
    
    // 2. Check SSTables (Newest to Oldest)
    for (let i = this.ssTables.length - 1; i >= 0; i--) {
      if (this.ssTables[i].has(key)) return this.ssTables[i].get(key);
    }
    return null;
  }

  private flush() {
    // Flush MemTable to "Disk" (SSTable list)
    // Sort keys to simulate SSTable structure (not strictly needed for Map but good for concept)
    const sorted = new Map([...this.memTable.entries()].sort());
    this.ssTables.push(sorted);
    this.memTable.clear();
  }
}
