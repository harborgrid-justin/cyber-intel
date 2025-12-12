
import { useState, useEffect, useCallback, useRef } from 'react';
import { queryClient } from './QueryClient';
import { QueryOptions, MutationOptions } from './QueryClient';
import { QueryState, MutationState } from '../store/types';

/**
 * Hook for fetching and caching data
 */
export function useQuery<T = any>(
  options: QueryOptions<T>
): QueryState<T> & {
  refetch: () => Promise<void>;
} {
  const {
    queryKey,
    queryFn,
    enabled = true,
    staleTime = 0,
    cacheTime = 5 * 60 * 1000,
    retry = 3,
    retryDelay = 1000,
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
    refetchInterval = false,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<QueryState<T>>(() => {
    const cached = queryClient.getQueryData<T>(queryKey);
    return {
      data: cached || null,
      isLoading: !cached && enabled,
      isFetching: !cached && enabled,
      isError: false,
      error: null,
      dataUpdatedAt: cached ? Date.now() : 0,
      errorUpdatedAt: 0,
      fetchStatus: enabled ? 'fetching' : 'idle'
    };
  });

  const mountedRef = useRef(true);
  const previousKeyRef = useRef(queryKey);

  const fetchData = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    setState(prev => ({
      ...prev,
      isFetching: true,
      fetchStatus: 'fetching' as const
    }));

    try {
      const data = await queryClient.fetchQuery(queryKey, queryFn, {
        staleTime,
        cacheTime,
        retry,
        retryDelay
      });

      if (!mountedRef.current) return;

      setState({
        data,
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        fetchStatus: 'idle'
      });

      onSuccess?.(data);
    } catch (error) {
      if (!mountedRef.current) return;

      const err = error instanceof Error ? error : new Error(String(error));

      setState(prev => ({
        ...prev,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: err,
        errorUpdatedAt: Date.now(),
        fetchStatus: 'idle'
      }));

      onError?.(err);
    }
  }, [queryKey, queryFn, enabled, staleTime, cacheTime, retry, retryDelay, onSuccess, onError]);

  const refetch = useCallback(async () => {
    queryClient.invalidateQueries(queryKey);
    await fetchData();
  }, [queryKey, fetchData]);

  // Subscribe to cache updates
  useEffect(() => {
    const unsubscribe = queryClient.subscribe(queryKey, () => {
      const data = queryClient.getQueryData<T>(queryKey);
      if (data !== undefined) {
        setState(prev => ({
          ...prev,
          data,
          dataUpdatedAt: Date.now()
        }));
      }
    });

    return unsubscribe;
  }, [queryKey]);

  // Initial fetch and refetch on key change
  useEffect(() => {
    const keyChanged = JSON.stringify(previousKeyRef.current) !== JSON.stringify(queryKey);
    previousKeyRef.current = queryKey;

    if (enabled && (keyChanged || state.isLoading)) {
      fetchData();
    }
  }, [queryKey, enabled, fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;

    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, enabled, refetch]);

  // Refetch on reconnect
  useEffect(() => {
    if (!refetchOnReconnect || !enabled) return;

    const handleOnline = () => {
      refetch();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refetchOnReconnect, enabled, refetch]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    queryClient.setupRefetchInterval(queryKey, queryFn, refetchInterval);

    return () => {
      // Clear interval when component unmounts
    };
  }, [refetchInterval, enabled, queryKey, queryFn]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    refetch
  };
}

/**
 * Hook for mutations (creating, updating, deleting data)
 */
export function useMutation<T = any, V = any>(
  options: MutationOptions<T, V>
): MutationState<T> & {
  mutate: (variables: V) => Promise<void>;
  mutateAsync: (variables: V) => Promise<T>;
  reset: () => void;
} {
  const { mutationFn, onSuccess, onError, onMutate, onSettled } = options;

  const [state, setState] = useState<MutationState<T>>({
    data: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null
  });

  const mutateAsync = useCallback(
    async (variables: V): Promise<T> => {
      setState({
        data: null,
        isLoading: true,
        isError: false,
        isSuccess: false,
        error: null
      });

      try {
        const data = await queryClient.executeMutation(mutationFn, variables, {
          onMutate,
          onSuccess,
          onError,
          onSettled
        });

        setState({
          data,
          isLoading: false,
          isError: false,
          isSuccess: true,
          error: null
        });

        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        setState({
          data: null,
          isLoading: false,
          isError: true,
          isSuccess: false,
          error: err
        });

        throw err;
      }
    },
    [mutationFn, onMutate, onSuccess, onError, onSettled]
  );

  const mutate = useCallback(
    async (variables: V): Promise<void> => {
      try {
        await mutateAsync(variables);
      } catch (error) {
        // Error is already handled in mutateAsync
      }
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
      error: null
    });
  }, []);

  return {
    ...state,
    mutate,
    mutateAsync,
    reset
  };
}

/**
 * Hook for infinite queries (pagination, infinite scroll)
 */
export function useInfiniteQuery<T = any>(
  options: QueryOptions<T[]> & {
    getNextPageParam?: (lastPage: T[], allPages: T[][]) => number | undefined;
    getPreviousPageParam?: (firstPage: T[], allPages: T[][]) => number | undefined;
  }
): QueryState<T[][]> & {
  fetchNextPage: () => Promise<void>;
  fetchPreviousPage: () => Promise<void>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  refetch: () => Promise<void>;
} {
  const { getNextPageParam, getPreviousPageParam, ...queryOptions } = options;

  const [pages, setPages] = useState<T[][]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const baseQuery = useQuery<T[]>({
    ...queryOptions,
    enabled: false
  });

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage) return;

    const nextPage = getNextPageParam?.(pages[pages.length - 1] || [], pages);
    if (nextPage === undefined) {
      setHasNextPage(false);
      return;
    }

    const data = await queryClient.fetchQuery(
      [...(Array.isArray(queryOptions.queryKey) ? queryOptions.queryKey : [queryOptions.queryKey]), 'page', nextPage],
      queryOptions.queryFn
    );

    setPages(prev => [...prev, data]);

    const newNextPage = getNextPageParam?.(data, [...pages, data]);
    setHasNextPage(newNextPage !== undefined);
  }, [pages, hasNextPage, getNextPageParam, queryOptions]);

  const fetchPreviousPage = useCallback(async () => {
    if (!hasPreviousPage) return;

    const previousPage = getPreviousPageParam?.(pages[0] || [], pages);
    if (previousPage === undefined) {
      setHasPreviousPage(false);
      return;
    }

    const data = await queryClient.fetchQuery(
      [...(Array.isArray(queryOptions.queryKey) ? queryOptions.queryKey : [queryOptions.queryKey]), 'page', previousPage],
      queryOptions.queryFn
    );

    setPages(prev => [data, ...prev]);

    const newPreviousPage = getPreviousPageParam?.(data, [data, ...pages]);
    setHasPreviousPage(newPreviousPage !== undefined);
  }, [pages, hasPreviousPage, getPreviousPageParam, queryOptions]);

  const refetch = useCallback(async () => {
    setPages([]);
    setHasNextPage(true);
    setHasPreviousPage(false);
    await fetchNextPage();
  }, [fetchNextPage]);

  // Initial fetch
  useEffect(() => {
    if (pages.length === 0 && queryOptions.enabled !== false) {
      fetchNextPage();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data: pages,
    isLoading: baseQuery.isLoading,
    isFetching: baseQuery.isFetching,
    isError: baseQuery.isError,
    error: baseQuery.error,
    dataUpdatedAt: baseQuery.dataUpdatedAt,
    errorUpdatedAt: baseQuery.errorUpdatedAt,
    fetchStatus: baseQuery.fetchStatus,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    refetch
  };
}
