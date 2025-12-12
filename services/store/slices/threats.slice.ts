
import { createSlice } from '../createStore';
import { ThreatsState, OptimisticUpdate, FilterState, SortState } from '../types';
import { Threat } from '../../../types';

const initialState: ThreatsState = {
  items: [],
  selected: null,
  status: 'idle',
  error: null,
  filters: {
    search: '',
    tags: [],
    severity: undefined,
    status: undefined
  },
  sort: {
    field: 'score',
    direction: 'desc'
  },
  pagination: {
    page: 1,
    pageSize: 50,
    total: 0,
    hasMore: false
  },
  selection: {
    selectedIds: new Set(),
    allSelected: false
  },
  cache: new Map(),
  optimisticUpdates: []
};

export const threatsSlice = createSlice({
  name: 'threats',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state) => ({ ...state, status: 'loading' as const }),
    setSuccess: (state) => ({ ...state, status: 'success' as const, error: null }),
    setError: (state, error: string) => ({ ...state, status: 'error' as const, error }),

    // CRUD operations
    setThreats: (state, threats: Threat[]) => ({
      ...state,
      items: threats,
      pagination: {
        ...state.pagination,
        total: threats.length
      }
    }),

    addThreat: (state, threat: Threat) => ({
      ...state,
      items: [threat, ...state.items],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1
      }
    }),

    updateThreat: (state, threat: Threat) => ({
      ...state,
      items: state.items.map(t => t.id === threat.id ? threat : t),
      selected: state.selected?.id === threat.id ? threat : state.selected
    }),

    deleteThreat: (state, id: string) => ({
      ...state,
      items: state.items.filter(t => t.id !== id),
      selected: state.selected?.id === id ? null : state.selected,
      pagination: {
        ...state.pagination,
        total: Math.max(0, state.pagination.total - 1)
      }
    }),

    // Selection
    selectThreat: (state, threat: Threat | null) => ({ ...state, selected: threat }),

    toggleSelection: (state, id: string) => {
      const newSelectedIds = new Set(state.selection.selectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedIds: newSelectedIds,
          allSelected: newSelectedIds.size === state.items.length
        }
      };
    },

    selectAll: (state) => ({
      ...state,
      selection: {
        selectedIds: new Set(state.items.map(t => t.id)),
        allSelected: true
      }
    }),

    clearSelection: (state) => ({
      ...state,
      selection: {
        selectedIds: new Set(),
        allSelected: false
      }
    }),

    // Filtering
    setFilters: (state, filters: Partial<FilterState>) => ({
      ...state,
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 } // Reset to first page
    }),

    clearFilters: (state) => ({
      ...state,
      filters: initialState.filters,
      pagination: { ...state.pagination, page: 1 }
    }),

    // Sorting
    setSort: (state, sort: SortState) => ({
      ...state,
      sort,
      pagination: { ...state.pagination, page: 1 }
    }),

    // Pagination
    setPage: (state, page: number) => ({
      ...state,
      pagination: { ...state.pagination, page }
    }),

    setPageSize: (state, pageSize: number) => ({
      ...state,
      pagination: { ...state.pagination, pageSize, page: 1 }
    }),

    // Optimistic updates
    addOptimisticUpdate: (state, update: OptimisticUpdate<Threat>) => ({
      ...state,
      optimisticUpdates: [...state.optimisticUpdates, update]
    }),

    removeOptimisticUpdate: (state, id: string) => ({
      ...state,
      optimisticUpdates: state.optimisticUpdates.filter(u => u.id !== id)
    }),

    clearOptimisticUpdates: (state) => ({
      ...state,
      optimisticUpdates: []
    }),

    // Batch operations
    bulkUpdateThreats: (state, updates: Array<{ id: string; changes: Partial<Threat> }>) => ({
      ...state,
      items: state.items.map(threat => {
        const update = updates.find(u => u.id === threat.id);
        return update ? { ...threat, ...update.changes } : threat;
      })
    }),

    bulkDeleteThreats: (state, ids: string[]) => ({
      ...state,
      items: state.items.filter(t => !ids.includes(t.id)),
      selection: {
        selectedIds: new Set(),
        allSelected: false
      },
      pagination: {
        ...state.pagination,
        total: Math.max(0, state.pagination.total - ids.length)
      }
    })
  }
});

export const threatsActions = threatsSlice.actions;
export const threatsReducer = threatsSlice.reducer;

// Selectors
export const threatsSelectors = {
  selectAll: (state: ThreatsState) => state.items,

  selectById: (state: ThreatsState, id: string) =>
    state.items.find(t => t.id === id),

  selectSelected: (state: ThreatsState) => state.selected,

  selectFiltered: (state: ThreatsState) => {
    let filtered = state.items;

    // Apply search filter
    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.indicator.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.threatActor.toLowerCase().includes(search)
      );
    }

    // Apply severity filter
    if (state.filters.severity) {
      filtered = filtered.filter(t => t.severity === state.filters.severity);
    }

    // Apply status filter
    if (state.filters.status) {
      filtered = filtered.filter(t => t.status === state.filters.status);
    }

    // Apply tags filter
    if (state.filters.tags.length > 0) {
      filtered = filtered.filter(t =>
        state.filters.tags.some(tag => t.tags?.includes(tag))
      );
    }

    return filtered;
  },

  selectSorted: (state: ThreatsState) => {
    const filtered = threatsSelectors.selectFiltered(state);
    const { field, direction } = state.sort;

    return [...filtered].sort((a, b) => {
      const aVal = (a as any)[field];
      const bVal = (b as any)[field];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return direction === 'asc' ? comparison : -comparison;
    });
  },

  selectPaginated: (state: ThreatsState) => {
    const sorted = threatsSelectors.selectSorted(state);
    const { page, pageSize } = state.pagination;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: sorted.slice(start, end),
      total: sorted.length,
      page,
      pageSize,
      hasMore: end < sorted.length
    };
  },

  selectByActor: (state: ThreatsState, actorName: string) =>
    state.items.filter(t => t.threatActor?.includes(actorName)),

  selectBySeverity: (state: ThreatsState, severity: string) =>
    state.items.filter(t => t.severity === severity),

  selectCritical: (state: ThreatsState) =>
    state.items.filter(t => t.severity === 'CRITICAL'),

  selectRecent: (state: ThreatsState, hours: number = 24) => {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return state.items.filter(t => {
      const lastSeen = new Date(t.lastSeen).getTime();
      return lastSeen > cutoff;
    });
  },

  selectSelected: (state: ThreatsState) =>
    state.items.filter(t => state.selection.selectedIds.has(t.id)),

  selectStatus: (state: ThreatsState) => state.status,

  selectError: (state: ThreatsState) => state.error,

  selectFilters: (state: ThreatsState) => state.filters,

  selectSort: (state: ThreatsState) => state.sort,

  selectPagination: (state: ThreatsState) => state.pagination
};
