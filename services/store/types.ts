
import { Threat, Case, ThreatActor, Campaign } from '../../types';

// Core store types
export type StoreListener = () => void;
export type StateSelector<T, R> = (state: T) => R;
export type StateUpdater<T> = (state: T) => Partial<T> | T;

// Status types
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingStatus;
  error: string | null;
  lastUpdated: number | null;
}

// Pagination types
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// Filter types
export interface FilterState {
  search: string;
  tags: string[];
  severity?: string;
  status?: string;
  dateRange?: { start: string; end: string };
  [key: string]: any;
}

// Sort types
export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// Selection types
export interface SelectionState {
  selectedIds: Set<string>;
  allSelected: boolean;
}

// Cache entry
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Query state
export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  dataUpdatedAt: number;
  errorUpdatedAt: number;
  fetchStatus: 'idle' | 'fetching' | 'paused';
}

// Mutation state
export interface MutationState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
}

// Optimistic update
export interface OptimisticUpdate<T> {
  id: string;
  type: 'add' | 'update' | 'delete';
  data: T;
  timestamp: number;
}

// Real-time sync types
export interface RealtimeEvent<T = any> {
  type: 'create' | 'update' | 'delete' | 'sync';
  entity: string;
  data: T;
  timestamp: number;
  source?: string;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastMessage: RealtimeEvent | null;
  reconnectAttempts: number;
}

// User/Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  clearance: string;
  permissions: string[];
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  status: LoadingStatus;
  error: string | null;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  filter: 'all' | 'unread';
  sound: boolean;
  desktop: boolean;
}

// Settings types
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

export interface DisplaySettings {
  layout: 'grid' | 'list' | 'table';
  density: 'comfortable' | 'compact' | 'spacious';
  showThumbnails: boolean;
  animationsEnabled: boolean;
}

export interface PrivacySettings {
  analytics: boolean;
  crashReporting: boolean;
  dataSharingEnabled: boolean;
}

export interface SettingsState {
  theme: ThemeSettings;
  display: DisplaySettings;
  privacy: PrivacySettings;
  locale: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
}

// Dashboard types
export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config: Record<string, any>;
  visible: boolean;
}

export interface DashboardState {
  widgets: DashboardWidget[];
  layout: 'default' | 'compact' | 'custom';
  autoRefresh: boolean;
  refreshInterval: number;
  stats: {
    totalThreats: number;
    activeCases: number;
    criticalAlerts: number;
    resolvedToday: number;
  };
}

// Threats slice state
export interface ThreatsState {
  items: Threat[];
  selected: Threat | null;
  status: LoadingStatus;
  error: string | null;
  filters: FilterState;
  sort: SortState;
  pagination: PaginationState;
  selection: SelectionState;
  cache: Map<string, CacheEntry<Threat>>;
  optimisticUpdates: OptimisticUpdate<Threat>[];
}

// Cases slice state
export interface CasesState {
  items: Case[];
  selected: Case | null;
  status: LoadingStatus;
  error: string | null;
  filters: FilterState;
  sort: SortState;
  pagination: PaginationState;
  selection: SelectionState;
  cache: Map<string, CacheEntry<Case>>;
}

// Actors slice state
export interface ActorsState {
  items: ThreatActor[];
  selected: ThreatActor | null;
  status: LoadingStatus;
  error: string | null;
  filters: FilterState;
  sort: SortState;
  pagination: PaginationState;
}

// Campaigns slice state
export interface CampaignsState {
  items: Campaign[];
  selected: Campaign | null;
  status: LoadingStatus;
  error: string | null;
  filters: FilterState;
  sort: SortState;
  pagination: PaginationState;
}

// Root state
export interface RootState {
  threats: ThreatsState;
  cases: CasesState;
  actors: ActorsState;
  campaigns: CampaignsState;
  dashboard: DashboardState;
  auth: AuthState;
  notifications: NotificationsState;
  settings: SettingsState;
  realtime: WebSocketState;
}

// Store interface
export interface Store<T = RootState> {
  getState: () => T;
  setState: (updater: StateUpdater<T>) => void;
  subscribe: (listener: StoreListener) => () => void;
  destroy: () => void;
}

// Slice configuration
export interface SliceConfig<T> {
  name: string;
  initialState: T;
  reducers: Record<string, (state: T, payload?: any) => T | Partial<T>>;
  selectors?: Record<string, StateSelector<T, any>>;
}

// Action type
export interface Action<P = any> {
  type: string;
  payload?: P;
  meta?: Record<string, any>;
}

// Middleware type
export type Middleware<T = RootState> = (
  store: Store<T>
) => (next: (action: Action) => void) => (action: Action) => void;

// Devtools integration
export interface DevtoolsAction {
  type: string;
  payload?: any;
  timestamp: number;
  state?: any;
}

export interface DevtoolsState {
  enabled: boolean;
  actions: DevtoolsAction[];
  maxActions: number;
  currentIndex: number;
}
