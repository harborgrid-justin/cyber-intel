
import { createSlice } from '../createStore';
import { DashboardState, DashboardWidget } from '../types';

const initialState: DashboardState = {
  widgets: [
    {
      id: 'threat-overview',
      type: 'threat-overview',
      title: 'Threat Overview',
      position: { x: 0, y: 0 },
      size: { w: 6, h: 4 },
      config: {},
      visible: true
    },
    {
      id: 'case-stats',
      type: 'case-stats',
      title: 'Case Statistics',
      position: { x: 6, y: 0 },
      size: { w: 6, h: 4 },
      config: {},
      visible: true
    },
    {
      id: 'threat-map',
      type: 'threat-map',
      title: 'Threat Map',
      position: { x: 0, y: 4 },
      size: { w: 12, h: 6 },
      config: {},
      visible: true
    }
  ],
  layout: 'default',
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  stats: {
    totalThreats: 0,
    activeCases: 0,
    criticalAlerts: 0,
    resolvedToday: 0
  }
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Widget management
    addWidget: (state, widget: DashboardWidget) => ({
      ...state,
      widgets: [...state.widgets, widget]
    }),

    updateWidget: (state, widget: DashboardWidget) => ({
      ...state,
      widgets: state.widgets.map(w => w.id === widget.id ? widget : w)
    }),

    deleteWidget: (state, id: string) => ({
      ...state,
      widgets: state.widgets.filter(w => w.id !== id)
    }),

    moveWidget: (state, payload: { id: string; position: { x: number; y: number } }) => ({
      ...state,
      widgets: state.widgets.map(w =>
        w.id === payload.id ? { ...w, position: payload.position } : w
      )
    }),

    resizeWidget: (state, payload: { id: string; size: { w: number; h: number } }) => ({
      ...state,
      widgets: state.widgets.map(w =>
        w.id === payload.id ? { ...w, size: payload.size } : w
      )
    }),

    toggleWidgetVisibility: (state, id: string) => ({
      ...state,
      widgets: state.widgets.map(w =>
        w.id === id ? { ...w, visible: !w.visible } : w
      )
    }),

    updateWidgetConfig: (state, payload: { id: string; config: Record<string, any> }) => ({
      ...state,
      widgets: state.widgets.map(w =>
        w.id === payload.id ? { ...w, config: { ...w.config, ...payload.config } } : w
      )
    }),

    // Layout management
    setLayout: (state, layout: 'default' | 'compact' | 'custom') => ({
      ...state,
      layout
    }),

    resetLayout: (state) => ({
      ...state,
      widgets: initialState.widgets,
      layout: 'default'
    }),

    // Auto-refresh settings
    setAutoRefresh: (state, enabled: boolean) => ({
      ...state,
      autoRefresh: enabled
    }),

    setRefreshInterval: (state, interval: number) => ({
      ...state,
      refreshInterval: interval
    }),

    // Stats updates
    updateStats: (state, stats: Partial<DashboardState['stats']>) => ({
      ...state,
      stats: { ...state.stats, ...stats }
    }),

    setStats: (state, stats: DashboardState['stats']) => ({
      ...state,
      stats
    }),

    // Batch operations
    setWidgets: (state, widgets: DashboardWidget[]) => ({
      ...state,
      widgets
    })
  }
});

export const dashboardActions = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;

// Selectors
export const dashboardSelectors = {
  selectAllWidgets: (state: DashboardState) => state.widgets,

  selectVisibleWidgets: (state: DashboardState) =>
    state.widgets.filter(w => w.visible),

  selectWidgetById: (state: DashboardState, id: string) =>
    state.widgets.find(w => w.id === id),

  selectWidgetsByType: (state: DashboardState, type: string) =>
    state.widgets.filter(w => w.type === type),

  selectLayout: (state: DashboardState) => state.layout,

  selectAutoRefresh: (state: DashboardState) => state.autoRefresh,

  selectRefreshInterval: (state: DashboardState) => state.refreshInterval,

  selectStats: (state: DashboardState) => state.stats
};
