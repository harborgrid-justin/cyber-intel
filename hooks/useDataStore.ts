
import { useSyncExternalStore, useRef, useEffect } from 'react';
import { fastDeepEqual } from '../services/utils/fastDeepEqual';
import { bus, EVENTS } from '../services/eventBus';

// Singleton store manager to hold subscribers
class StoreManager {
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(l => l());
  }
}

const storeManager = new StoreManager();

// Hook into both the old window events AND the new event bus for backwards compatibility
if (typeof window !== 'undefined') {
  // Legacy window events (for gradual migration)
  window.addEventListener('data-update', () => storeManager.notify());
  window.addEventListener('user-update', () => storeManager.notify());
  window.addEventListener('config-update', () => storeManager.notify());

  // New event bus integration
  bus.on(EVENTS.DATA_UPDATE, () => storeManager.notify());
  bus.on(EVENTS.USER_UPDATE, () => storeManager.notify());
  bus.on(EVENTS.CONFIG_UPDATE, () => storeManager.notify());
  bus.on(EVENTS.THEME_UPDATE, () => storeManager.notify());
  bus.on(EVENTS.DB_ADAPTER_CHANGE, () => storeManager.notify());
}

/**
 * Advanced React 18 Hook using useSyncExternalStore with Result Stabilization.
 * Prevents infinite loops when stores return new references for identical data.
 *
 * Features:
 * - Integrates with event bus for cross-store communication
 * - Deep equality checks to prevent unnecessary re-renders
 * - Supports optional selectors for efficient data slicing
 * - Type-safe with full TypeScript support
 *
 * @param getData - Function that returns the data from the store
 * @param selector - Optional selector function to slice the data
 * @param options - Optional configuration for event filtering
 * @returns The selected data slice
 */
export function useDataStore<T, Slice = T>(
  getData: () => T,
  selector?: (data: T) => Slice,
  options?: {
    /** Only re-render when these specific store keys are updated */
    filterStoreKeys?: string[];
    /** Enable debug logging for this hook instance */
    debug?: boolean;
  }
): Slice {
  // Ref to hold the last stable result
  const resultRef = useRef<Slice>(undefined as unknown as Slice);
  const initializedRef = useRef(false);
  const updateCountRef = useRef(0);

  const getSnapshot = () => {
    // 1. Get raw data
    const data = getData();

    // 2. Apply selector if present
    const slice = selector ? selector(data) : (data as unknown as Slice);

    // 3. Initialize if first run
    if (!initializedRef.current) {
        resultRef.current = slice;
        initializedRef.current = true;
        if (options?.debug) {
          console.log('[useDataStore] Initialized:', slice);
        }
        return slice;
    }

    // 4. Compare with previous result to ensure referential stability
    // This stops React from re-rendering if the *content* hasn't changed,
    // even if the *reference* from getData() is new (e.g. from .filter()).
    if (fastDeepEqual(resultRef.current, slice)) {
      return resultRef.current;
    }

    // 5. Update ref if deep equal fails
    updateCountRef.current++;
    if (options?.debug) {
      console.log('[useDataStore] Update #' + updateCountRef.current, slice);
    }
    resultRef.current = slice;
    return slice;
  };

  // Optional: Set up event bus filtering if specific store keys are provided
  useEffect(() => {
    if (options?.filterStoreKeys && options.filterStoreKeys.length > 0) {
      const unsubscribe = bus.on(EVENTS.DATA_UPDATE, (payload: any) => {
        if (payload?.storeKey && options.filterStoreKeys?.includes(payload.storeKey)) {
          storeManager.notify();
        }
      });
      return unsubscribe;
    }
  }, [options?.filterStoreKeys]);

  return useSyncExternalStore(
    (cb) => storeManager.subscribe(cb),
    getSnapshot,
    getSnapshot // Server snapshot (same for this client-heavy app)
  );
}
