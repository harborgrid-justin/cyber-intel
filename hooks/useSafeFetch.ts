
import { useState, useEffect, useRef } from 'react';

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useSafeFetch<T>(url: string, options?: RequestInit): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    loading: true,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Abort previous request if new one starts
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch(url, { ...options, signal });
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        if (!signal.aborted) {
          setState({ data, error: null, loading: false });
        }
      } catch (error: any) {
        if (!signal.aborted) {
          setState({ data: null, error, loading: false });
        }
      }
    };

    fetchData();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [url]); // Only re-fetch if URL changes

  return state;
}
