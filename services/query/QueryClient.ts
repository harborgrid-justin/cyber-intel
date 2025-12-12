
import { QueryState, MutationState } from '../store/types';

export interface QueryOptions<T> {
  queryKey: string | string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number; // Time before data is considered stale (ms)
  cacheTime?: number; // Time before inactive data is garbage collected (ms)
  retry?: number | boolean;
  retryDelay?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchInterval?: number | false;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface MutationOptions<T, V = any> {
  mutationFn: (variables: V) => Promise<T>;
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: Error, variables: V) => void;
  onMutate?: (variables: V) => Promise<any> | any;
  onSettled?: (data: T | undefined, error: Error | null, variables: V) => void;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  error: Error | null;
  isStale: boolean;
  subscribers: Set<() => void>;
}

/**
 * React Query-like client for managing server state
 */
export class QueryClient {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private queries: Map<string, Promise<any>> = new Map();
  private gcTimers: Map<string, any> = new Map();
  private refetchIntervals: Map<string, any> = new Map();

  /**
   * Get cached query data
   */
  getQueryData<T = any>(queryKey: string | string[]): T | undefined {
    const key = this.serializeKey(queryKey);
    return this.cache.get(key)?.data;
  }

  /**
   * Set query data manually
   */
  setQueryData<T = any>(
    queryKey: string | string[],
    data: T | ((old: T | undefined) => T)
  ): void {
    const key = this.serializeKey(queryKey);
    const existing = this.cache.get(key);

    const newData =
      typeof data === 'function' ? (data as Function)(existing?.data) : data;

    this.cache.set(key, {
      data: newData,
      timestamp: Date.now(),
      error: null,
      isStale: false,
      subscribers: existing?.subscribers || new Set()
    });

    this.notifySubscribers(key);
  }

  /**
   * Invalidate queries to mark them as stale
   */
  invalidateQueries(queryKey: string | string[]): void {
    const key = this.serializeKey(queryKey);
    const entry = this.cache.get(key);

    if (entry) {
      entry.isStale = true;
      this.notifySubscribers(key);
    }
  }

  /**
   * Refetch a query
   */
  async refetchQueries(queryKey: string | string[]): Promise<void> {
    const key = this.serializeKey(queryKey);
    const entry = this.cache.get(key);

    if (entry) {
      entry.isStale = true;
      this.notifySubscribers(key);
    }
  }

  /**
   * Remove queries from cache
   */
  removeQueries(queryKey: string | string[]): void {
    const key = this.serializeKey(queryKey);
    this.cache.delete(key);
    this.queries.delete(key);
    this.clearGCTimer(key);
    this.clearRefetchInterval(key);
  }

  /**
   * Clear all cached queries
   */
  clear(): void {
    this.cache.clear();
    this.queries.clear();
    this.gcTimers.forEach(timer => clearTimeout(timer));
    this.refetchIntervals.forEach(interval => clearInterval(interval));
    this.gcTimers.clear();
    this.refetchIntervals.clear();
  }

  /**
   * Fetch query data
   */
  async fetchQuery<T = any>(
    queryKey: string | string[],
    queryFn: () => Promise<T>,
    options: Partial<QueryOptions<T>> = {}
  ): Promise<T> {
    const {
      staleTime = 0,
      cacheTime = 5 * 60 * 1000, // 5 minutes
      retry = 3,
      retryDelay = 1000
    } = options;

    const key = this.serializeKey(queryKey);
    const cached = this.cache.get(key);

    // Return cached data if not stale
    if (cached && !cached.isStale) {
      const age = Date.now() - cached.timestamp;
      if (age < staleTime) {
        return cached.data;
      }
    }

    // Check if query is already in progress
    const inProgress = this.queries.get(key);
    if (inProgress) {
      return inProgress;
    }

    // Execute query
    const queryPromise = this.executeQuery(queryFn, retry as number, retryDelay);
    this.queries.set(key, queryPromise);

    try {
      const data = await queryPromise;

      // Update cache
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        error: null,
        isStale: false,
        subscribers: cached?.subscribers || new Set()
      });

      this.notifySubscribers(key);
      this.scheduleGC(key, cacheTime);

      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      this.cache.set(key, {
        data: cached?.data,
        timestamp: Date.now(),
        error: err,
        isStale: true,
        subscribers: cached?.subscribers || new Set()
      });

      this.notifySubscribers(key);
      throw err;
    } finally {
      this.queries.delete(key);
    }
  }

  /**
   * Execute mutation
   */
  async executeMutation<T = any, V = any>(
    mutationFn: (variables: V) => Promise<T>,
    variables: V,
    options: Partial<MutationOptions<T, V>> = {}
  ): Promise<T> {
    const { onMutate, onSuccess, onError, onSettled } = options;

    let snapshot: any;

    try {
      // Call onMutate for optimistic updates
      if (onMutate) {
        snapshot = await onMutate(variables);
      }

      // Execute mutation
      const data = await mutationFn(variables);

      // Call onSuccess
      if (onSuccess) {
        onSuccess(data, variables);
      }

      // Call onSettled
      if (onSettled) {
        onSettled(data, null, variables);
      }

      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Call onError
      if (onError) {
        onError(err, variables);
      }

      // Call onSettled
      if (onSettled) {
        onSettled(undefined, err, variables);
      }

      throw err;
    }
  }

  /**
   * Subscribe to query updates
   */
  subscribe(queryKey: string | string[], callback: () => void): () => void {
    const key = this.serializeKey(queryKey);
    let entry = this.cache.get(key);

    if (!entry) {
      entry = {
        data: undefined,
        timestamp: 0,
        error: null,
        isStale: true,
        subscribers: new Set()
      };
      this.cache.set(key, entry);
    }

    entry.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      entry?.subscribers.delete(callback);
      if (entry?.subscribers.size === 0) {
        // Start GC timer when no subscribers
        this.scheduleGC(key, 5 * 60 * 1000);
      }
    };
  }

  /**
   * Prefetch query data
   */
  async prefetchQuery<T = any>(
    queryKey: string | string[],
    queryFn: () => Promise<T>,
    options: Partial<QueryOptions<T>> = {}
  ): Promise<void> {
    await this.fetchQuery(queryKey, queryFn, options);
  }

  /**
   * Setup refetch interval
   */
  setupRefetchInterval(
    queryKey: string | string[],
    queryFn: () => Promise<any>,
    interval: number
  ): void {
    const key = this.serializeKey(queryKey);

    this.clearRefetchInterval(key);

    const intervalId = setInterval(() => {
      this.fetchQuery(queryKey, queryFn);
    }, interval);

    this.refetchIntervals.set(key, intervalId);
  }

  private serializeKey(queryKey: string | string[]): string {
    return Array.isArray(queryKey) ? JSON.stringify(queryKey) : queryKey;
  }

  private async executeQuery<T>(
    queryFn: () => Promise<T>,
    retries: number,
    retryDelay: number
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await queryFn();
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise(resolve =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }
    throw new Error('Query failed');
  }

  private notifySubscribers(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.subscribers.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in query subscriber:', error);
        }
      });
    }
  }

  private scheduleGC(key: string, cacheTime: number): void {
    this.clearGCTimer(key);

    const timerId = setTimeout(() => {
      const entry = this.cache.get(key);
      // Only remove if no active subscribers
      if (entry && entry.subscribers.size === 0) {
        this.cache.delete(key);
        this.queries.delete(key);
      }
    }, cacheTime);

    this.gcTimers.set(key, timerId);
  }

  private clearGCTimer(key: string): void {
    const timerId = this.gcTimers.get(key);
    if (timerId) {
      clearTimeout(timerId);
      this.gcTimers.delete(key);
    }
  }

  private clearRefetchInterval(key: string): void {
    const intervalId = this.refetchIntervals.get(key);
    if (intervalId) {
      clearInterval(intervalId);
      this.refetchIntervals.delete(key);
    }
  }
}

// Global query client instance
export const queryClient = new QueryClient();
