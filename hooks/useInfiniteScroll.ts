
import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseInfiniteScrollOptions<T> {
  fetchMore: (page: number) => Promise<T[]>;
  initialPage?: number;
  pageSize?: number;
  threshold?: number; // Distance from bottom to trigger load (px)
  enabled?: boolean;
}

export interface UseInfiniteScrollResult<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
  reset: () => void;
  ref: React.RefObject<HTMLElement>;
}

/**
 * Infinite scrolling support with auto-load and manual trigger
 */
export function useInfiniteScroll<T = any>(
  options: UseInfiniteScrollOptions<T>
): UseInfiniteScrollResult<T> {
  const {
    fetchMore,
    initialPage = 1,
    pageSize = 20,
    threshold = 200,
    enabled = true
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const newItems = await fetchMore(page);

      if (newItems.length === 0 || newItems.length < pageSize) {
        setHasMore(false);
      }

      setItems((prev) => [...prev, ...newItems]);
      setPage((prev) => prev + 1);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, page, loading, hasMore, pageSize, enabled]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    setLoading(false);
  }, [initialPage]);

  // Intersection Observer for automatic loading
  useEffect(() => {
    if (!enabled || !hasMore) return;

    const options = {
      root: containerRef.current,
      rootMargin: `${threshold}px`,
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading) {
        loadMore();
      }
    }, options);

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, loading, loadMore, threshold]);

  // Initial load
  useEffect(() => {
    if (items.length === 0 && enabled) {
      loadMore();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items,
    loading,
    error,
    hasMore,
    page,
    loadMore,
    reset,
    ref: containerRef
  };
}

/**
 * Scroll position hook for "scroll to top" functionality
 */
export function useScrollPosition(threshold: number = 300): {
  scrollY: number;
  isScrolled: boolean;
  scrollToTop: () => void;
} {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    scrollY,
    isScrolled: scrollY > threshold,
    scrollToTop
  };
}
