
/**
 * State persistence layer with support for localStorage, sessionStorage, and IndexedDB
 */

export interface PersistenceOptions {
  key: string;
  storage?: 'local' | 'session' | 'indexeddb';
  version?: number;
  migrate?: (oldData: any, oldVersion: number) => any;
  serialize?: (data: any) => string;
  deserialize?: (data: string) => any;
  debounceMs?: number;
  whitelist?: string[]; // Keys to persist
  blacklist?: string[]; // Keys to exclude
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * LocalStorage adapter
 */
class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('[LocalStorage] Get error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('[LocalStorage] Set error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[LocalStorage] Remove error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('[LocalStorage] Clear error:', error);
    }
  }
}

/**
 * SessionStorage adapter
 */
class SessionStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('[SessionStorage] Get error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('[SessionStorage] Set error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('[SessionStorage] Remove error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('[SessionStorage] Clear error:', error);
    }
  }
}

/**
 * IndexedDB adapter for large datasets
 */
class IndexedDBAdapter implements StorageAdapter {
  private dbName = 'sentinel-db';
  private storeName = 'persistence';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async getItem(key: string): Promise<string | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async removeItem(key: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

/**
 * Main persistence manager
 */
export class PersistenceManager<T = any> {
  private adapter: StorageAdapter;
  private debounceTimer: any = null;

  constructor(private options: PersistenceOptions) {
    // Select storage adapter
    switch (options.storage) {
      case 'session':
        this.adapter = new SessionStorageAdapter();
        break;
      case 'indexeddb':
        this.adapter = new IndexedDBAdapter();
        break;
      case 'local':
      default:
        this.adapter = new LocalStorageAdapter();
        break;
    }
  }

  /**
   * Load persisted state
   */
  async load(): Promise<T | null> {
    try {
      const raw = await this.adapter.getItem(this.options.key);
      if (!raw) return null;

      const deserialized = this.options.deserialize
        ? this.options.deserialize(raw)
        : JSON.parse(raw);

      // Check version and migrate if needed
      if (deserialized._version !== this.options.version) {
        const migrated = this.options.migrate
          ? this.options.migrate(deserialized, deserialized._version || 0)
          : deserialized;

        // Save migrated data
        await this.save({ ...migrated, _version: this.options.version });
        return migrated;
      }

      return deserialized;
    } catch (error) {
      console.error('[PersistenceManager] Load error:', error);
      return null;
    }
  }

  /**
   * Save state with debouncing
   */
  async save(state: T): Promise<void> {
    const { debounceMs = 1000, whitelist, blacklist } = this.options;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      try {
        // Filter state based on whitelist/blacklist
        let filtered = state;

        if (whitelist || blacklist) {
          filtered = this.filterState(state, whitelist, blacklist);
        }

        // Add version
        const versionedState = {
          ...filtered,
          _version: this.options.version || 1
        };

        const serialized = this.options.serialize
          ? this.options.serialize(versionedState)
          : JSON.stringify(versionedState);

        await this.adapter.setItem(this.options.key, serialized);
      } catch (error) {
        console.error('[PersistenceManager] Save error:', error);
      }
    }, debounceMs);
  }

  /**
   * Clear persisted state
   */
  async clear(): Promise<void> {
    try {
      await this.adapter.removeItem(this.options.key);
    } catch (error) {
      console.error('[PersistenceManager] Clear error:', error);
    }
  }

  /**
   * Filter state based on whitelist/blacklist
   */
  private filterState(
    state: any,
    whitelist?: string[],
    blacklist?: string[]
  ): any {
    if (!state || typeof state !== 'object') return state;

    if (whitelist) {
      const filtered: any = {};
      whitelist.forEach(key => {
        if (key in state) {
          filtered[key] = state[key];
        }
      });
      return filtered;
    }

    if (blacklist) {
      const filtered = { ...state };
      blacklist.forEach(key => {
        delete filtered[key];
      });
      return filtered;
    }

    return state;
  }
}

/**
 * Create a persistence manager
 */
export function createPersistence<T = any>(
  options: PersistenceOptions
): PersistenceManager<T> {
  return new PersistenceManager<T>(options);
}

/**
 * Storage quota management
 */
export class StorageQuotaManager {
  /**
   * Get storage quota info
   */
  async getQuota(): Promise<{
    usage: number;
    quota: number;
    percentage: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      return { usage, quota, percentage };
    }

    return { usage: 0, quota: 0, percentage: 0 };
  }

  /**
   * Check if storage is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const quota = await this.getQuota();
      return quota.percentage < 90; // Consider unavailable if > 90% full
    } catch {
      return false;
    }
  }

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * Global quota manager instance
 */
export const quotaManager = new StorageQuotaManager();
