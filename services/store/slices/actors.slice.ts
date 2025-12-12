
import { createSlice } from '../createStore';
import { ActorsState, FilterState, SortState } from '../types';
import { ThreatActor } from '../../../types';

const initialState: ActorsState = {
  items: [],
  selected: null,
  status: 'idle',
  error: null,
  filters: {
    search: '',
    tags: [],
    sophistication: undefined,
    origin: undefined
  },
  sort: {
    field: 'name',
    direction: 'asc'
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: false
  }
};

export const actorsSlice = createSlice({
  name: 'actors',
  initialState,
  reducers: {
    setLoading: (state) => ({ ...state, status: 'loading' as const }),
    setSuccess: (state) => ({ ...state, status: 'success' as const, error: null }),
    setError: (state, error: string) => ({ ...state, status: 'error' as const, error }),

    setActors: (state, actors: ThreatActor[]) => ({
      ...state,
      items: actors,
      pagination: { ...state.pagination, total: actors.length }
    }),

    addActor: (state, actor: ThreatActor) => ({
      ...state,
      items: [actor, ...state.items],
      pagination: { ...state.pagination, total: state.pagination.total + 1 }
    }),

    updateActor: (state, actor: ThreatActor) => ({
      ...state,
      items: state.items.map(a => a.id === actor.id ? actor : a),
      selected: state.selected?.id === actor.id ? actor : state.selected
    }),

    deleteActor: (state, id: string) => ({
      ...state,
      items: state.items.filter(a => a.id !== id),
      selected: state.selected?.id === id ? null : state.selected,
      pagination: { ...state.pagination, total: Math.max(0, state.pagination.total - 1) }
    }),

    selectActor: (state, actor: ThreatActor | null) => ({ ...state, selected: actor }),

    // Add TTP
    addTTP: (state, payload: { actorId: string; ttp: any }) => ({
      ...state,
      items: state.items.map(a =>
        a.id === payload.actorId
          ? { ...a, ttps: [...a.ttps, payload.ttp] }
          : a
      )
    }),

    // Add infrastructure
    addInfrastructure: (state, payload: { actorId: string; infra: any }) => ({
      ...state,
      items: state.items.map(a =>
        a.id === payload.actorId
          ? { ...a, infrastructure: [...a.infrastructure, payload.infra] }
          : a
      )
    }),

    // Filtering
    setFilters: (state, filters: Partial<FilterState>) => ({
      ...state,
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }
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
    })
  }
});

export const actorsActions = actorsSlice.actions;
export const actorsReducer = actorsSlice.reducer;

// Selectors
export const actorsSelectors = {
  selectAll: (state: ActorsState) => state.items,

  selectById: (state: ActorsState, id: string) =>
    state.items.find(a => a.id === id),

  selectSelected: (state: ActorsState) => state.selected,

  selectFiltered: (state: ActorsState) => {
    let filtered = state.items;

    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(search) ||
        a.aliases.some(alias => alias.toLowerCase().includes(search)) ||
        a.description.toLowerCase().includes(search)
      );
    }

    if (state.filters.sophistication) {
      filtered = filtered.filter(a => a.sophistication === state.filters.sophistication);
    }

    if (state.filters.origin) {
      filtered = filtered.filter(a => a.origin === state.filters.origin);
    }

    return filtered;
  },

  selectSorted: (state: ActorsState) => {
    const filtered = actorsSelectors.selectFiltered(state);
    const { field, direction } = state.sort;

    return [...filtered].sort((a, b) => {
      const aVal = (a as any)[field];
      const bVal = (b as any)[field];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return direction === 'asc' ? comparison : -comparison;
    });
  },

  selectPaginated: (state: ActorsState) => {
    const sorted = actorsSelectors.selectSorted(state);
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

  selectBySophistication: (state: ActorsState, sophistication: string) =>
    state.items.filter(a => a.sophistication === sophistication),

  selectByOrigin: (state: ActorsState, origin: string) =>
    state.items.filter(a => a.origin === origin),

  selectByTarget: (state: ActorsState, target: string) =>
    state.items.filter(a => a.targets.includes(target)),

  selectStatus: (state: ActorsState) => state.status,

  selectError: (state: ActorsState) => state.error
};
