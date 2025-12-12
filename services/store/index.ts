
import { createStore, combineReducers, loadPersistedState, createDevtoolsMiddleware, createPersistenceMiddleware } from './createStore';
import { RootState, WebSocketState } from './types';
import { threatsReducer } from './slices/threats.slice';
import { casesReducer } from './slices/cases.slice';
import { actorsReducer } from './slices/actors.slice';
import { campaignsReducer } from './slices/campaigns.slice';
import { dashboardReducer } from './slices/dashboard.slice';
import { authReducer } from './slices/auth.slice';
import { notificationsReducer } from './slices/notifications.slice';
import { settingsReducer } from './slices/settings.slice';

// WebSocket/Realtime state reducer
const realtimeInitialState: WebSocketState = {
  connected: false,
  connecting: false,
  error: null,
  lastMessage: null,
  reconnectAttempts: 0
};

const realtimeReducer = (state: WebSocketState = realtimeInitialState, action: any): WebSocketState => {
  switch (action.type) {
    case 'realtime/connecting':
      return { ...state, connecting: true, error: null };
    case 'realtime/connected':
      return { ...state, connected: true, connecting: false, reconnectAttempts: 0, error: null };
    case 'realtime/disconnected':
      return { ...state, connected: false, connecting: false };
    case 'realtime/error':
      return { ...state, error: action.payload, connecting: false };
    case 'realtime/message':
      return { ...state, lastMessage: action.payload };
    case 'realtime/incrementReconnect':
      return { ...state, reconnectAttempts: state.reconnectAttempts + 1 };
    default:
      return state;
  }
};

// Combine all reducers
const rootReducer = combineReducers<RootState>({
  threats: threatsReducer,
  cases: casesReducer,
  actors: actorsReducer,
  campaigns: campaignsReducer,
  dashboard: dashboardReducer,
  auth: authReducer,
  notifications: notificationsReducer,
  settings: settingsReducer,
  realtime: realtimeReducer
});

// Initial state
const getInitialState = (): RootState => {
  // Try to load persisted state
  const persistedState = loadPersistedState<RootState>('sentinel-store');

  // Get initial state from reducers
  const baseInitialState = rootReducer({} as RootState, { type: '@@INIT' });

  // Merge persisted state with initial state
  // Only persist certain slices
  return {
    ...baseInitialState,
    settings: persistedState?.settings || baseInitialState.settings,
    dashboard: persistedState?.dashboard || baseInitialState.dashboard,
    auth: persistedState?.auth || baseInitialState.auth,
    // Don't persist notifications, threats, cases, actors, campaigns
    notifications: baseInitialState.notifications,
    threats: baseInitialState.threats,
    cases: baseInitialState.cases,
    actors: baseInitialState.actors,
    campaigns: baseInitialState.campaigns,
    realtime: baseInitialState.realtime
  };
};

// Create middlewares
const middlewares = [
  createDevtoolsMiddleware(100),
  createPersistenceMiddleware('sentinel-store', localStorage, 1000)
];

// Add logger in development
if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
  // We'll conditionally add the logger based on a flag
}

// Create the store
export const store = createStore<RootState>(getInitialState(), middlewares);

// Export actions from all slices
export { threatsActions } from './slices/threats.slice';
export { casesActions } from './slices/cases.slice';
export { actorsActions } from './slices/actors.slice';
export { campaignsActions } from './slices/campaigns.slice';
export { dashboardActions } from './slices/dashboard.slice';
export { authActions } from './slices/auth.slice';
export { notificationsActions } from './slices/notifications.slice';
export { settingsActions } from './slices/settings.slice';

// Export selectors from all slices
export { threatsSelectors } from './slices/threats.slice';
export { casesSelectors } from './slices/cases.slice';
export { actorsSelectors } from './slices/actors.slice';
export { campaignsSelectors } from './slices/campaigns.slice';
export { dashboardSelectors } from './slices/dashboard.slice';
export { authSelectors } from './slices/auth.slice';
export { notificationsSelectors } from './slices/notifications.slice';
export { settingsSelectors } from './slices/settings.slice';

// Export types
export type { RootState, Store } from './types';
export * from './types';

// Realtime actions
export const realtimeActions = {
  connecting: () => ({ type: 'realtime/connecting' }),
  connected: () => ({ type: 'realtime/connected' }),
  disconnected: () => ({ type: 'realtime/disconnected' }),
  error: (error: string) => ({ type: 'realtime/error', payload: error }),
  message: (message: any) => ({ type: 'realtime/message', payload: message }),
  incrementReconnect: () => ({ type: 'realtime/incrementReconnect' })
};

// Utility function to dispatch actions
export const dispatch = (action: any) => {
  if ((store as any).dispatch) {
    (store as any).dispatch(action);
  }
};

// Export the store as default
export default store;
