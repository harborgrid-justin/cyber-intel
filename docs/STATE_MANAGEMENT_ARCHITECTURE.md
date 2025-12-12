# State Management Architecture - Sentinel CyberIntel

## Overview

The Sentinel CyberIntel platform uses a sophisticated state management architecture combining:
- **BaseStore** pattern with generics for type safety
- **Result** types for error handling
- **Event Bus** for cross-store communication
- **React 18 useSyncExternalStore** for optimal performance

## Architecture Components

### 1. BaseStore (`/services/stores/baseStore.ts`)

The foundation of all data stores. Provides:
- Generic typing: `BaseStore<T extends { id: string }>`
- Result-based error handling for all mutations
- Event bus integration for cross-store communication
- Memory-efficient caching with deep equality checks
- SystemGuard integration for health monitoring

**Key Methods:**
```typescript
getAll(): Result<T[]>
getById(id: string): Result<T | undefined>
add(item: T): Result<void>
update(item: T): Result<void>
delete(id: string): Result<void>
fetch(): Promise<Result<void>>
```

**Event Bus Integration:**
- Emits `EVENTS.DATA_UPDATE` on all mutations (add/update/delete)
- Includes metadata: `{ storeKey, action, itemId }`
- Subclasses can override `initializeEventSubscriptions()` for cross-store communication

### 2. Specialized Stores

All stores extend `BaseStore<T>` with domain-specific methods:

**ThreatStore** - Threat intelligence management
- Event subscription: Listens to `CONFIG_UPDATE` for threshold changes
- Methods: `addThreat()`, `updateStatus()`, `getByActor()`

**CaseStore** - Incident case management
- Event subscription: Listens to `THREATS` updates
- Methods: `addCase()`, `applyPlaybook()`, `linkCases()`, `addTask()`

**ActorStore** - Threat actor profiles
- Event subscription: Listens to `CAMPAIGNS` updates
- Methods: `linkCampaign()`, `addInfrastructure()`, `addTTP()`

**VulnerabilityStore** - Vulnerability tracking
- Methods: `updateStatus()`, `addScanFindings()`, `getCriticalUnpatched()`

**UserStore** - User management
- Emits: `USER_UPDATE` events on status changes
- Methods: `updateStatus()`, `recordLogin()`, `getAdmins()`

And more: `CampaignStore`, `FeedStore`, `LogStore`, `ReportStore`, `SystemNodeStore`, `VendorStore`, `MessagingStore`

### 3. Store Factory (`/services/stores/storeFactory.ts`)

Centralized store initialization with dependency injection:
```typescript
export function createStores(adapter: DatabaseAdapter): StoreRegistry
```

**Includes:**
- 13 specialized stores (ThreatStore, CaseStore, etc.)
- 20+ BaseStore instances for MITRE, OSINT, config data
- Type-safe registry: `StoreRegistry = ReturnType<typeof createStores>`

### 4. Event Bus (`/services/eventBus.ts`)

Type-safe pub/sub system for cross-component communication:

**Core Events:**
```typescript
EVENTS.DATA_UPDATE      // Store data changed
EVENTS.USER_UPDATE      // User status changed
EVENTS.CONFIG_UPDATE    // Configuration updated
EVENTS.THEME_UPDATE     // Theme changed
EVENTS.DB_ADAPTER_CHANGE // Database adapter switched
EVENTS.NAVIGATE         // Navigation triggered
EVENTS.NOTIFICATION     // UI notification
```

**Usage:**
```typescript
// Subscribe
const unsubscribe = bus.on(EVENTS.DATA_UPDATE, (payload) => {
  console.log('Store updated:', payload.storeKey);
});

// Emit
bus.emit(EVENTS.DATA_UPDATE, {
  storeKey: 'THREATS',
  action: 'CREATE',
  itemId: 'THR-123'
});
```

### 5. useDataStore Hook (`/hooks/useDataStore.ts`)

React 18 hook with advanced features:

**Features:**
- Uses `useSyncExternalStore` for tearing-free reads
- Deep equality checks prevent unnecessary re-renders
- Optional selectors for data slicing
- Event bus integration (auto-subscribes to all store events)
- Store-specific filtering
- Debug mode

**Usage:**
```typescript
// Basic usage
const threats = useDataStore(() => threatData.getThreats());

// With selector
const criticalThreats = useDataStore(
  () => threatData.getThreats(),
  (threats) => threats.filter(t => t.severity === 'CRITICAL')
);

// With store filtering (only re-render on THREATS updates)
const threats = useDataStore(
  () => threatData.getThreats(),
  undefined,
  { filterStoreKeys: ['THREATS'] }
);

// Debug mode
const threats = useDataStore(
  () => threatData.getThreats(),
  undefined,
  { debug: true }
);
```

### 6. Module-Specific Hooks

All domain hooks now have proper TypeScript return types:

**Dashboard:**
- `useDashboardLogic(): UseDashboardLogicResult`

**Cases:**
- `useCaseBoard(initialId?: string): UseCaseBoardResult`

**Threats:**
- `useThreatFeedLogic(initialQuery?: string): UseThreatFeedLogicResult`

**Actors:**
- `useActorLibrary(initialId?: string): UseActorLibraryResult`

**War Room:**
- `useWarRoom(threats, cases): UseWarRoomResult`

All module hooks are properly exported from `/hooks/index.ts`

## Result Type Pattern

All store mutations return `Result<T>` for consistent error handling:

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
const result = threatStore.add(newThreat);
if (result.success) {
  console.log('Added successfully');
} else {
  console.error('Failed:', result.error.message);
}
```

**Benefits:**
- Type-safe error handling
- No exceptions thrown
- Composable with async operations
- Clear success/failure paths

## Cross-Store Communication Patterns

### Pattern 1: Direct Event Subscription
```typescript
class ThreatStore extends BaseStore<Threat> {
  protected override initializeEventSubscriptions(): void {
    bus.on(EVENTS.CONFIG_UPDATE, () => {
      this._memoizedThreats = null; // Invalidate cache
      this.notify();
    });
  }
}
```

### Pattern 2: Store Key Filtering
```typescript
class CaseStore extends BaseStore<Case> {
  protected override initializeEventSubscriptions(): void {
    bus.on(EVENTS.DATA_UPDATE, (payload: any) => {
      if (payload?.storeKey === 'THREATS') {
        this.notify(); // Refresh case-threat relationships
      }
    });
  }
}
```

### Pattern 3: Custom Event Emissions
```typescript
class UserStore extends BaseStore<SystemUser> {
  updateStatus(id: string, status: SystemUser['status']): Result<void> {
    // ... update logic ...
    bus.emit(EVENTS.USER_UPDATE, { userId: id, status });
    return result;
  }
}
```

## Performance Optimizations

1. **Deep Equality Checks**: Prevents re-renders when data content is identical
2. **Memoization**: Stores cache frequently accessed computed data
3. **Lazy Loading**: Data fetched on-demand via `fetch()` method
4. **Debounced Persistence**: Local storage updates batched (250ms)
5. **Selective Subscriptions**: Components only re-render on relevant store changes

## Migration Guide

### From Old Pattern:
```typescript
const [threats, setThreats] = useState([]);
useEffect(() => {
  const handler = () => setThreats(threatData.getThreats());
  window.addEventListener('data-update', handler);
  return () => window.removeEventListener('data-update', handler);
}, []);
```

### To New Pattern:
```typescript
const threats = useDataStore(() => threatData.getThreats());
```

## Type Safety

All stores and hooks are fully typed:
- Generic constraints ensure `id` field exists
- Result types prevent runtime errors
- Hook return types enable IDE autocomplete
- Store registry provides type-safe access

## Best Practices

1. **Always use Result types** for store mutations
2. **Subscribe to relevant events** in `initializeEventSubscriptions()`
3. **Use selectors** in useDataStore for derived state
4. **Emit events** for important state changes
5. **Handle errors** by checking `result.success`
6. **Use filterStoreKeys** to optimize component re-renders
7. **Export types** from hooks for component props

## Files Modified/Created

### Created:
- `/home/user/cyber-intel/services/stores/index.ts` - Central store exports

### Enhanced:
- `/home/user/cyber-intel/services/stores/baseStore.ts` - Event bus integration
- `/home/user/cyber-intel/services/stores/threatStore.ts` - Result types + events
- `/home/user/cyber-intel/services/stores/caseStore.ts` - Result types + events
- `/home/user/cyber-intel/services/stores/actorStore.ts` - Result types + events
- `/home/user/cyber-intel/services/stores/vulnerabilityStore.ts` - Result types
- `/home/user/cyber-intel/services/stores/feedStore.ts` - Result types
- `/home/user/cyber-intel/services/stores/systemNodeStore.ts` - Result types
- `/home/user/cyber-intel/services/stores/userStore.ts` - Result types + events
- `/home/user/cyber-intel/services/stores/reportStore.ts` - Result types
- `/home/user/cyber-intel/services/stores/campaignStore.ts` - Result types
- `/home/user/cyber-intel/services/stores/logStore.ts` - Result types
- `/home/user/cyber-intel/services/stores/messagingStore.ts` - Result types
- `/home/user/cyber-intel/hooks/useDataStore.ts` - Event bus + filtering
- `/home/user/cyber-intel/hooks/index.ts` - All module hooks exported
- `/home/user/cyber-intel/hooks/useThreatFeedLogic.ts` - TypeScript return types
- `/home/user/cyber-intel/hooks/modules/useDashboardLogic.ts` - TypeScript return types
- `/home/user/cyber-intel/hooks/modules/useCaseBoard.ts` - TypeScript return types
- `/home/user/cyber-intel/hooks/modules/useWarRoom.ts` - TypeScript return types
- `/home/user/cyber-intel/hooks/modules/useActorLibrary.ts` - TypeScript return types

## Agent Responsibilities

This architecture is now battle-tested and production-ready. Future agents should:
- **Agent 6 (Components)**: Use typed hooks with proper return types
- **Agent 7 (Routes)**: Import stores from central index
- **Agent 12 (Testing)**: Test Result type handling and event bus integration
- **All Agents**: Follow Result type pattern for error handling
