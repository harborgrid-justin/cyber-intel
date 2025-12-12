
import { createSlice } from '../createStore';
import { CampaignsState, FilterState, SortState } from '../types';
import { Campaign } from '../../../types';

const initialState: CampaignsState = {
  items: [],
  selected: null,
  status: 'idle',
  error: null,
  filters: {
    search: '',
    tags: [],
    status: undefined
  },
  sort: {
    field: 'lastSeen',
    direction: 'desc'
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: false
  }
};

export const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    setLoading: (state) => ({ ...state, status: 'loading' as const }),
    setSuccess: (state) => ({ ...state, status: 'success' as const, error: null }),
    setError: (state, error: string) => ({ ...state, status: 'error' as const, error }),

    setCampaigns: (state, campaigns: Campaign[]) => ({
      ...state,
      items: campaigns,
      pagination: { ...state.pagination, total: campaigns.length }
    }),

    addCampaign: (state, campaign: Campaign) => ({
      ...state,
      items: [campaign, ...state.items],
      pagination: { ...state.pagination, total: state.pagination.total + 1 }
    }),

    updateCampaign: (state, campaign: Campaign) => ({
      ...state,
      items: state.items.map(c => c.id === campaign.id ? campaign : c),
      selected: state.selected?.id === campaign.id ? campaign : state.selected
    }),

    deleteCampaign: (state, id: string) => ({
      ...state,
      items: state.items.filter(c => c.id !== id),
      selected: state.selected?.id === id ? null : state.selected,
      pagination: { ...state.pagination, total: Math.max(0, state.pagination.total - 1) }
    }),

    selectCampaign: (state, campaign: Campaign | null) => ({ ...state, selected: campaign }),

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

export const campaignsActions = campaignsSlice.actions;
export const campaignsReducer = campaignsSlice.reducer;

// Selectors
export const campaignsSelectors = {
  selectAll: (state: CampaignsState) => state.items,

  selectById: (state: CampaignsState, id: string) =>
    state.items.find(c => c.id === id),

  selectSelected: (state: CampaignsState) => state.selected,

  selectFiltered: (state: CampaignsState) => {
    let filtered = state.items;

    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search)
      );
    }

    if (state.filters.status) {
      filtered = filtered.filter(c => c.status === state.filters.status);
    }

    return filtered;
  },

  selectSorted: (state: CampaignsState) => {
    const filtered = campaignsSelectors.selectFiltered(state);
    const { field, direction } = state.sort;

    return [...filtered].sort((a, b) => {
      const aVal = (a as any)[field];
      const bVal = (b as any)[field];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return direction === 'asc' ? comparison : -comparison;
    });
  },

  selectPaginated: (state: CampaignsState) => {
    const sorted = campaignsSelectors.selectSorted(state);
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

  selectActive: (state: CampaignsState) =>
    state.items.filter(c => c.status === 'ACTIVE'),

  selectByActor: (state: CampaignsState, actorId: string) =>
    state.items.filter(c => c.actors.includes(actorId)),

  selectByRegion: (state: CampaignsState, region: string) =>
    state.items.filter(c => c.targetRegions.includes(region)),

  selectBySector: (state: CampaignsState, sector: string) =>
    state.items.filter(c => c.targetSectors.includes(sector)),

  selectStatus: (state: CampaignsState) => state.status,

  selectError: (state: CampaignsState) => state.error
};
