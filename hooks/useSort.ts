
import { useState, useCallback, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T = any> {
  field: keyof T;
  direction: SortDirection;
}

export interface UseSortResult<T> {
  sortConfig: SortConfig<T> | null;
  sortedItems: T[];
  sortBy: (field: keyof T) => void;
  setSortConfig: (config: SortConfig<T> | null) => void;
  clearSort: () => void;
}

/**
 * Sorting logic hook with multi-level support
 */
export function useSort<T extends Record<string, any>>(
  items: T[],
  defaultSort?: SortConfig<T>
): UseSortResult<T> {
  const [sortConfig, setSortConfigState] = useState<SortConfig<T> | null>(
    defaultSort || null
  );

  const sortBy = useCallback((field: keyof T) => {
    setSortConfigState((prev) => {
      if (prev?.field === field) {
        // Toggle direction
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      // New field, default to ascending
      return { field, direction: 'asc' };
    });
  }, []);

  const setSortConfig = useCallback((config: SortConfig<T> | null) => {
    setSortConfigState(config);
  }, []);

  const clearSort = useCallback(() => {
    setSortConfigState(null);
  }, []);

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;

    const { field, direction } = sortConfig;

    return [...items].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === 'asc' ? 1 : -1;
      if (bVal == null) return direction === 'asc' ? -1 : 1;

      // Handle different types
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Handle dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return direction === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      // Default comparison
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortConfig]);

  return {
    sortConfig,
    sortedItems,
    sortBy,
    setSortConfig,
    clearSort
  };
}

/**
 * Multi-level sorting hook
 */
export function useMultiSort<T extends Record<string, any>>(
  items: T[]
): {
  sortConfigs: SortConfig<T>[];
  sortedItems: T[];
  addSort: (field: keyof T) => void;
  removeSort: (field: keyof T) => void;
  clearSorts: () => void;
} {
  const [sortConfigs, setSortConfigs] = useState<SortConfig<T>[]>([]);

  const addSort = useCallback((field: keyof T) => {
    setSortConfigs((prev) => {
      const existing = prev.find(s => s.field === field);
      if (existing) {
        // Toggle direction
        return prev.map(s =>
          s.field === field
            ? { ...s, direction: s.direction === 'asc' ? 'desc' as const : 'asc' as const }
            : s
        );
      }
      // Add new sort
      return [...prev, { field, direction: 'asc' as const }];
    });
  }, []);

  const removeSort = useCallback((field: keyof T) => {
    setSortConfigs((prev) => prev.filter(s => s.field !== field));
  }, []);

  const clearSorts = useCallback(() => {
    setSortConfigs([]);
  }, []);

  const sortedItems = useMemo(() => {
    if (sortConfigs.length === 0) return items;

    return [...items].sort((a, b) => {
      for (const config of sortConfigs) {
        const { field, direction } = config;
        const aVal = a[field];
        const bVal = b[field];

        if (aVal == null && bVal == null) continue;
        if (aVal == null) return direction === 'asc' ? 1 : -1;
        if (bVal == null) return direction === 'asc' ? -1 : 1;

        let comparison = 0;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal);
        } else if (aVal < bVal) {
          comparison = -1;
        } else if (aVal > bVal) {
          comparison = 1;
        }

        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }
      }

      return 0;
    });
  }, [items, sortConfigs]);

  return {
    sortConfigs,
    sortedItems,
    addSort,
    removeSort,
    clearSorts
  };
}
