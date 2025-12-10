
interface LogEntry {
  id: string;
  op: 'INSERT' | 'UPDATE' | 'DELETE';
  collection: string;
  payload: any;
  timestamp: number;
}

export class WriteAheadLog {
  private static STORAGE_KEY = 'SENTINEL_WAL_V1';

  static log(op: LogEntry['op'], collection: string, payload: any): void {
    const entries = this.read();
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      op,
      collection,
      payload,
      timestamp: Date.now()
    };
    entries.push(entry);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
  }

  static read(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  static flush(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static replay(handler: (entry: LogEntry) => void): void {
    const entries = this.read();
    entries.sort((a, b) => a.timestamp - b.timestamp);
    entries.forEach(handler);
    this.flush();
  }
}
