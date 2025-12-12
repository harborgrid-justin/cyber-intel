
import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  cacheTTL?: number; // Time-to-live in milliseconds
  retryCount?: number;
  retryDelay?: number;
  transformResponse?: (data: any) => T;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (optimisticData?: T) => void;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Global cache
const apiCache = new Map<string, CacheEntry<any>>();

/**
 * Generic API hook with caching, retry logic, and optimistic updates
 */
export function useApi<T = any>(
  fetcher: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const {
    immediate = true,
    onSuccess,
    onError,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    retryCount = 3,
    retryDelay = 1000,
    transformResponse
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheKey = useRef(`cache-${Date.now()}-${Math.random()}`);

  // Update fetcher ref when it changes
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const fetchData = useCallback(async (retries = 0) => {
    // Check cache first
    const cached = apiCache.get(cacheKey.current);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      setData(cached.data);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();
      const finalData = transformResponse ? transformResponse(result) : result;

      // Update cache
      apiCache.set(cacheKey.current, {
        data: finalData,
        timestamp: Date.now()
      });

      setData(finalData);
      setError(null);
      onSuccess?.(finalData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      // Retry logic
      if (retries < retryCount) {
        setTimeout(() => {
          fetchData(retries + 1);
        }, retryDelay * Math.pow(2, retries)); // Exponential backoff
        return;
      }

      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [cacheTTL, retryCount, retryDelay, onSuccess, onError, transformResponse]);

  // Optimistic update
  const mutate = useCallback((optimisticData?: T) => {
    if (optimisticData) {
      setData(optimisticData);
      // Update cache with optimistic data
      apiCache.set(cacheKey.current, {
        data: optimisticData,
        timestamp: Date.now()
      });
    }
    fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate
  };
}

/**
 * Hook for making API requests with manual trigger
 */
export function useApiLazy<T = any>(
  fetcher: () => Promise<T>,
  options: Omit<UseApiOptions<T>, 'immediate'> = {}
): UseApiResult<T> & { execute: () => Promise<void> } {
  const result = useApi(fetcher, { ...options, immediate: false });

  return {
    ...result,
    execute: result.refetch
  };
}

/**
 * Clear entire API cache
 */
export function clearApiCache(): void {
  apiCache.clear();
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(key: string): void {
  apiCache.delete(key);
}
