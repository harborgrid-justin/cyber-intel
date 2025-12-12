
import { useState, useCallback, useMemo } from 'react';

export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'notIn'
  | 'between';

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface UseFiltersResult<T> {
  filters: Filter[];
  addFilter: (filter: Filter) => void;
  removeFilter: (field: string) => void;
  updateFilter: (field: string, operator: FilterOperator, value: any) => void;
  clearFilters: () => void;
  setFilters: (filters: Filter[]) => void;
  applyFilters: (items: T[]) => T[];
  hasFilters: boolean;
  getFilter: (field: string) => Filter | undefined;
}

/**
 * Advanced filtering hook with multiple operators
 */
export function useFilters<T extends Record<string, any>>(): UseFiltersResult<T> {
  const [filters, setFiltersState] = useState<Filter[]>([]);

  const addFilter = useCallback((filter: Filter) => {
    setFiltersState((prev) => {
      // Remove existing filter for the same field
      const filtered = prev.filter(f => f.field !== filter.field);
      return [...filtered, filter];
    });
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFiltersState((prev) => prev.filter(f => f.field !== field));
  }, []);

  const updateFilter = useCallback((field: string, operator: FilterOperator, value: any) => {
    addFilter({ field, operator, value });
  }, [addFilter]);

  const clearFilters = useCallback(() => {
    setFiltersState([]);
  }, []);

  const setFilters = useCallback((newFilters: Filter[]) => {
    setFiltersState(newFilters);
  }, []);

  const getFilter = useCallback((field: string): Filter | undefined => {
    return filters.find(f => f.field === field);
  }, [filters]);

  const applyFilters = useCallback((items: T[]): T[] => {
    if (filters.length === 0) return items;

    return items.filter(item => {
      return filters.every(filter => {
        const itemValue = item[filter.field];
        const filterValue = filter.value;

        switch (filter.operator) {
          case 'equals':
            return itemValue === filterValue;

          case 'notEquals':
            return itemValue !== filterValue;

          case 'contains':
            return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());

          case 'notContains':
            return !String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());

          case 'startsWith':
            return String(itemValue).toLowerCase().startsWith(String(filterValue).toLowerCase());

          case 'endsWith':
            return String(itemValue).toLowerCase().endsWith(String(filterValue).toLowerCase());

          case 'gt':
            return Number(itemValue) > Number(filterValue);

          case 'gte':
            return Number(itemValue) >= Number(filterValue);

          case 'lt':
            return Number(itemValue) < Number(filterValue);

          case 'lte':
            return Number(itemValue) <= Number(filterValue);

          case 'in':
            return Array.isArray(filterValue) && filterValue.includes(itemValue);

          case 'notIn':
            return Array.isArray(filterValue) && !filterValue.includes(itemValue);

          case 'between':
            if (Array.isArray(filterValue) && filterValue.length === 2) {
              const [min, max] = filterValue;
              return Number(itemValue) >= Number(min) && Number(itemValue) <= Number(max);
            }
            return false;

          default:
            return true;
        }
      });
    });
  }, [filters]);

  const hasFilters = useMemo(() => filters.length > 0, [filters]);

  return {
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    setFilters,
    applyFilters,
    hasFilters,
    getFilter
  };
}

/**
 * Simple filter hook for common use cases
 */
export function useSimpleFilter<T extends Record<string, any>>(
  items: T[],
  searchFields: (keyof T)[]
): {
  search: string;
  setSearch: (value: string) => void;
  filteredItems: T[];
} {
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    if (!search) return items;

    const searchLower = search.toLowerCase();
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [items, search, searchFields]);

  return {
    search,
    setSearch,
    filteredItems
  };
}
