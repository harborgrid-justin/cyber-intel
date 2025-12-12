# SENTINEL State Management System

A comprehensive, type-safe state management solution for the SENTINEL Cyber Intelligence Platform.

## Architecture Overview

### Core Components

1. **Store** - Centralized state container with Redux-like architecture
2. **Slices** - Domain-specific state modules (threats, cases, actors, etc.)
3. **Query Client** - React Query-like data fetching and caching
4. **Real-time Sync** - WebSocket/SSE integration with optimistic updates
5. **Persistence Layer** - LocalStorage, SessionStorage, and IndexedDB support
6. **DevTools** - Time-travel debugging and performance monitoring

## Store Structure

```typescript
RootState {
  threats: ThreatsState
  cases: CasesState
  actors: ActorsState
  campaigns: CampaignsState
  dashboard: DashboardState
  auth: AuthState
  notifications: NotificationsState
  settings: SettingsState
  realtime: WebSocketState
}
```

## Usage Examples

### Using Store Slices

```typescript
import { store, threatsActions, threatsSelectors } from '@/services/store';

// Subscribe to state changes
const unsubscribe = store.subscribe(() => {
  const state = store.getState();
  const threats = threatsSelectors.selectAll(state.threats);
  console.log('Threats updated:', threats);
});

// Dispatch actions
store.setState(state => ({
  ...state,
  threats: threatsActions.addThreat(state.threats, newThreat)
}));
```

### Using Query Hooks

```typescript
import { useQuery, useMutation } from '@/services/query';

// Fetch data with caching
const { data, loading, error, refetch } = useQuery({
  queryKey: 'threats',
  queryFn: async () => {
    const response = await fetch('/api/threats');
    return response.json();
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true
});

// Mutate data with optimistic updates
const { mutate, isLoading } = useMutation({
  mutationFn: async (threat) => {
    const response = await fetch('/api/threats', {
      method: 'POST',
      body: JSON.stringify(threat)
    });
    return response.json();
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries(['threats']);
  }
});
```

### Using Advanced Hooks

```typescript
import {
  useApi,
  useRealtime,
  useInfiniteScroll,
  usePagination,
  useFilters,
  useSort,
  useSelection,
  useUndo
} from '@/hooks';

// API hook with caching
const { data, loading, refetch } = useApi(
  () => fetch('/api/threats').then(r => r.json()),
  {
    cacheTTL: 5 * 60 * 1000,
    retryCount: 3
  }
);

// Real-time WebSocket connection
const { connected, lastMessage, send } = useRealtime({
  url: 'ws://localhost:3000/ws',
  reconnect: true,
  onMessage: (event) => {
    console.log('Received:', event);
  }
});

// Infinite scroll
const { items, loadMore, hasMore } = useInfiniteScroll({
  fetchMore: async (page) => {
    const response = await fetch(`/api/threats?page=${page}`);
    return response.json();
  }
});

// Pagination
const pagination = usePagination({ initialPageSize: 20 });
const paginatedItems = pagination.paginate(items);

// Filters
const filters = useFilters();
filters.addFilter({ field: 'severity', operator: 'equals', value: 'CRITICAL' });
const filtered = filters.applyFilters(items);

// Sorting
const { sortedItems, sortBy } = useSort(items, { field: 'score', direction: 'desc' });

// Selection
const selection = useSelection(items);
selection.toggle(itemId);

// Undo/Redo
const { state, setState, undo, redo, canUndo, canRedo } = useUndo(initialState);
```

### Real-time Sync

```typescript
import { RealtimeSync, OptimisticUpdateManager } from '@/services/sync';

// Create sync manager
const sync = new RealtimeSync({
  url: 'ws://localhost:3000/ws',
  reconnect: true,
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected')
});

// Register handler
sync.registerHandler('threats', (event) => {
  console.log('Threat event:', event);

  if (event.type === 'create') {
    // Handle new threat
  }
});

// Connect
sync.connect();

// Optimistic updates
const optimistic = new OptimisticUpdateManager();
optimistic.apply('threats', threatId, updatedThreat);

// Later, confirm or rollback
optimistic.confirm(threatId);
// or
optimistic.rollback('threats', threatId);
```

### State Persistence

```typescript
import { createPersistence } from '@/services/storage';

// Create persistence manager
const persistence = createPersistence({
  key: 'sentinel-state',
  storage: 'local', // 'local' | 'session' | 'indexeddb'
  version: 1,
  whitelist: ['settings', 'auth'], // Only persist these keys
  debounceMs: 1000
});

// Load state
const savedState = await persistence.load();

// Save state
await persistence.save(currentState);

// Clear state
await persistence.clear();
```

### DevTools

```typescript
import { StateDevTools, perfMonitor } from '@/services/devtools';

// Create devtools
const devtools = new StateDevTools(store, {
  maxHistory: 50,
  enabled: true
});

// Access via console
window.__SENTINEL_DEVTOOLS__

// Methods available:
devtools.getActionHistory()
devtools.getStateHistory()
devtools.timeTravel(10)
devtools.jumpToAction(5)
devtools.exportState()
devtools.importState(json)
devtools.diff(0, 1)
devtools.printStats()

// Performance monitoring
const end = perfMonitor.start('fetch-threats');
await fetchThreats();
end(); // Automatically records timing

perfMonitor.printStats();
```

## Features

### State Management
- ✅ Redux-like architecture with slices
- ✅ Type-safe actions and selectors
- ✅ Middleware support (logger, devtools, persistence)
- ✅ Time-travel debugging
- ✅ Action history and replay

### Data Fetching
- ✅ Query client with caching
- ✅ Automatic retry with exponential backoff
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Mutation support
- ✅ Infinite queries

### Real-time Sync
- ✅ WebSocket connection management
- ✅ Automatic reconnection
- ✅ Optimistic UI updates
- ✅ Conflict resolution
- ✅ Server-sent events support

### Persistence
- ✅ LocalStorage support
- ✅ SessionStorage support
- ✅ IndexedDB for large datasets
- ✅ Automatic migration
- ✅ Quota management

### Advanced Hooks
- ✅ useApi - Generic API calls with caching
- ✅ useRealtime - WebSocket/SSE integration
- ✅ useInfiniteScroll - Infinite scrolling
- ✅ usePagination - Pagination logic
- ✅ useFilters - Advanced filtering
- ✅ useSort - Multi-level sorting
- ✅ useSelection - Multi-select with keyboard support
- ✅ useUndo - Undo/redo functionality
- ✅ useQueryParams - URL state management

### Developer Tools
- ✅ Action logging
- ✅ State debugging
- ✅ Time-travel debugging
- ✅ Performance monitoring
- ✅ State export/import
- ✅ State diffing

## Performance Considerations

- **Efficient Re-rendering**: Uses subscription pattern to minimize re-renders
- **Memoization**: Selectors are memoized for performance
- **Caching**: Query client caches responses with configurable TTL
- **Debouncing**: Persistence is debounced to reduce I/O
- **Lazy Loading**: Supports code splitting and lazy loading
- **Optimistic Updates**: Immediate UI updates with rollback support

## Offline Support

The system is designed with offline-first capabilities:
- Local state persists across sessions
- Query cache survives page reloads
- Optimistic updates queue for later sync
- Automatic conflict resolution

## Type Safety

All components are fully typed with TypeScript:
- Strict typing for state and actions
- Inferred types for selectors
- Generic types for reusable components
- No `any` types in production code

## Best Practices

1. **Use Selectors**: Always access state through selectors, not directly
2. **Memoize Heavy Computations**: Use selectors with memoization
3. **Batch Updates**: Group related state updates together
4. **Clean Up Subscriptions**: Always unsubscribe when components unmount
5. **Use DevTools**: Enable devtools in development for debugging
6. **Monitor Performance**: Use performance monitor to identify bottlenecks
7. **Handle Errors**: Always handle query/mutation errors gracefully

## Migration Guide

If migrating from the existing store system:

1. Import new store: `import { store } from '@/services/store'`
2. Replace direct state access with selectors
3. Use actions instead of direct mutations
4. Migrate to useQuery hooks for data fetching
5. Enable persistence for relevant slices
6. Set up real-time sync handlers

## Contributing

When adding new features:
1. Create slice in `/services/store/slices/`
2. Add types to `/services/store/types.ts`
3. Export actions and selectors from slice
4. Add to root reducer in `/services/store/index.ts`
5. Write tests for selectors and actions
6. Update this documentation
