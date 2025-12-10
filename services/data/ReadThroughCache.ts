
export class ReadThroughCache<T> {
  private cache = new Map<string, { val: T, expiry: number }>();
  private ttl: number;
  private fetcher: (key: string) => Promise<T>;

  constructor(fetcher: (key: string) => Promise<T>, ttlMs = 60000) {
    this.fetcher = fetcher;
    this.ttl = ttlMs;
  }

  async get(key: string): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.val;
    }

    const val = await this.fetcher(key);
    this.cache.set(key, { val, expiry: Date.now() + this.ttl });
    return val;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }
}
