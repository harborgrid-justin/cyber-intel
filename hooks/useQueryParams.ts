
import { useState, useCallback, useEffect } from 'react';

export type QueryParams = Record<string, string | string[] | undefined>;

/**
 * URL state management hook for query parameters
 */
export function useQueryParams<T extends QueryParams = QueryParams>(): {
  params: T;
  setParams: (params: Partial<T>) => void;
  setParam: (key: keyof T, value: string | string[] | undefined) => void;
  removeParam: (key: keyof T) => void;
  clearParams: () => void;
} {
  const [params, setParamsState] = useState<T>(() => {
    if (typeof window === 'undefined') return {} as T;

    const searchParams = new URLSearchParams(window.location.search);
    const parsed: any = {};

    searchParams.forEach((value, key) => {
      // Handle array parameters (key[]=value)
      if (key.endsWith('[]')) {
        const cleanKey = key.slice(0, -2);
        if (!parsed[cleanKey]) {
          parsed[cleanKey] = [];
        }
        parsed[cleanKey].push(value);
      } else {
        // Check if this key appears multiple times
        const allValues = searchParams.getAll(key);
        parsed[key] = allValues.length > 1 ? allValues : value;
      }
    });

    return parsed as T;
  });

  // Sync with browser history
  const updateURL = useCallback((newParams: T) => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams();

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(`${key}[]`, v));
      } else {
        searchParams.set(key, String(value));
      }
    });

    const newURL = `${window.location.pathname}${
      searchParams.toString() ? `?${searchParams.toString()}` : ''
    }`;

    window.history.pushState({}, '', newURL);
  }, []);

  const setParams = useCallback(
    (newParams: Partial<T>) => {
      setParamsState((prev) => {
        const updated = { ...prev, ...newParams };
        updateURL(updated);
        return updated;
      });
    },
    [updateURL]
  );

  const setParam = useCallback(
    (key: keyof T, value: string | string[] | undefined) => {
      setParams({ [key]: value } as Partial<T>);
    },
    [setParams]
  );

  const removeParam = useCallback(
    (key: keyof T) => {
      setParamsState((prev) => {
        const updated = { ...prev };
        delete updated[key];
        updateURL(updated);
        return updated;
      });
    },
    [updateURL]
  );

  const clearParams = useCallback(() => {
    setParamsState({} as T);
    updateURL({} as T);
  }, [updateURL]);

  // Listen to popstate events (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const parsed: any = {};

      searchParams.forEach((value, key) => {
        if (key.endsWith('[]')) {
          const cleanKey = key.slice(0, -2);
          if (!parsed[cleanKey]) {
            parsed[cleanKey] = [];
          }
          parsed[cleanKey].push(value);
        } else {
          const allValues = searchParams.getAll(key);
          parsed[key] = allValues.length > 1 ? allValues : value;
        }
      });

      setParamsState(parsed as T);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    params,
    setParams,
    setParam,
    removeParam,
    clearParams
  };
}

/**
 * Hook to sync state with a specific query parameter
 */
export function useQueryParam<T extends string | string[]>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const { params, setParam } = useQueryParams();

  const value = (params[key] as T) ?? defaultValue;

  const setValue = useCallback(
    (newValue: T) => {
      setParam(key, newValue);
    },
    [key, setParam]
  );

  return [value, setValue];
}
