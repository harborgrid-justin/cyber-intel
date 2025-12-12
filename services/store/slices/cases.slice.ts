
import { createSlice } from '../createStore';
import { CasesState, FilterState, SortState } from '../types';
import { Case } from '../../../types';

const initialState: CasesState = {
  items: [],
  selected: null,
  status: 'idle',
  error: null,
  filters: {
    search: '',
    tags: [],
    status: undefined,
    priority: undefined
  },
  sort: {
    field: 'created',
    direction: 'desc'
  },
  pagination: {
    page: 1,
    pageSize: 25,
    total: 0,
    hasMore: false
  },
  selection: {
    selectedIds: new Set(),
    allSelected: false
  },
  cache: new Map()
};

export const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    setLoading: (state) => ({ ...state, status: 'loading' as const }),
    setSuccess: (state) => ({ ...state, status: 'success' as const, error: null }),
    setError: (state, error: string) => ({ ...state, status: 'error' as const, error }),

    setCases: (state, cases: Case[]) => ({
      ...state,
      items: cases,
      pagination: { ...state.pagination, total: cases.length }
    }),

    addCase: (state, caseItem: Case) => ({
      ...state,
      items: [caseItem, ...state.items],
      pagination: { ...state.pagination, total: state.pagination.total + 1 }
    }),

    updateCase: (state, caseItem: Case) => ({
      ...state,
      items: state.items.map(c => c.id === caseItem.id ? caseItem : c),
      selected: state.selected?.id === caseItem.id ? caseItem : state.selected
    }),

    deleteCase: (state, id: string) => ({
      ...state,
      items: state.items.filter(c => c.id !== id),
      selected: state.selected?.id === id ? null : state.selected,
      pagination: { ...state.pagination, total: Math.max(0, state.pagination.total - 1) }
    }),

    selectCase: (state, caseItem: Case | null) => ({ ...state, selected: caseItem }),

    // Tasks management
    addTask: (state, payload: { caseId: string; task: any }) => ({
      ...state,
      items: state.items.map(c =>
        c.id === payload.caseId
          ? { ...c, tasks: [...c.tasks, payload.task] }
          : c
      )
    }),

    updateTask: (state, payload: { caseId: string; taskId: string; changes: any }) => ({
      ...state,
      items: state.items.map(c =>
        c.id === payload.caseId
          ? {
              ...c,
              tasks: c.tasks.map(t =>
                t.id === payload.taskId ? { ...t, ...payload.changes } : t
              )
            }
          : c
      )
    }),

    deleteTask: (state, payload: { caseId: string; taskId: string }) => ({
      ...state,
      items: state.items.map(c =>
        c.id === payload.caseId
          ? { ...c, tasks: c.tasks.filter(t => t.id !== payload.taskId) }
          : c
      )
    }),

    // Notes management
    addNote: (state, payload: { caseId: string; note: any }) => ({
      ...state,
      items: state.items.map(c =>
        c.id === payload.caseId
          ? { ...c, notes: [...c.notes, payload.note] }
          : c
      )
    }),

    // Artifacts management
    addArtifact: (state, payload: { caseId: string; artifact: any }) => ({
      ...state,
      items: state.items.map(c =>
        c.id === payload.caseId
          ? { ...c, artifacts: [...c.artifacts, payload.artifact] }
          : c
      )
    }),

    // Timeline management
    addTimelineEvent: (state, payload: { caseId: string; event: any }) => ({
      ...state,
      items: state.items.map(c =>
        c.id === payload.caseId
          ? { ...c, timeline: [...c.timeline, payload.event] }
          : c
      )
    }),

    // Selection
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
          selectedIds: newSelectedIds,
          allSelected: newSelectedIds.size === state.items.length
        }
      };
    },

    selectAll: (state) => ({
      ...state,
      selection: {
        selectedIds: new Set(state.items.map(c => c.id)),
        allSelected: true
      }
    }),

    clearSelection: (state) => ({
      ...state,
      selection: { selectedIds: new Set(), allSelected: false }
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

export const casesActions = casesSlice.actions;
export const casesReducer = casesSlice.reducer;

// Selectors
export const casesSelectors = {
  selectAll: (state: CasesState) => state.items,

  selectById: (state: CasesState, id: string) =>
    state.items.find(c => c.id === id),

  selectSelected: (state: CasesState) => state.selected,

  selectFiltered: (state: CasesState) => {
    let filtered = state.items;

    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search)
      );
    }

    if (state.filters.status) {
      filtered = filtered.filter(c => c.status === state.filters.status);
    }

    if (state.filters.priority) {
      filtered = filtered.filter(c => c.priority === state.filters.priority);
    }

    return filtered;
  },

  selectSorted: (state: CasesState) => {
    const filtered = casesSelectors.selectFiltered(state);
    const { field, direction } = state.sort;

    return [...filtered].sort((a, b) => {
      const aVal = (a as any)[field];
      const bVal = (b as any)[field];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return direction === 'asc' ? comparison : -comparison;
    });
  },

  selectPaginated: (state: CasesState) => {
    const sorted = casesSelectors.selectSorted(state);
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

  selectByStatus: (state: CasesState, status: string) =>
    state.items.filter(c => c.status === status),

  selectByPriority: (state: CasesState, priority: string) =>
    state.items.filter(c => c.priority === priority),

  selectOpen: (state: CasesState) =>
    state.items.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS'),

  selectCritical: (state: CasesState) =>
    state.items.filter(c => c.priority === 'CRITICAL'),

  selectByAssignee: (state: CasesState, assignee: string) =>
    state.items.filter(c => c.assignee === assignee),

  selectWithSLABreach: (state: CasesState) =>
    state.items.filter(c => c.slaBreach === true),

  selectStatus: (state: CasesState) => state.status,

  selectError: (state: CasesState) => state.error
};
