
import { useSyncExternalStore, useRef } from 'react';
import { fastDeepEqual } from '../services/utils/fastDeepEqual';

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

// Hook into the global event bus to trigger store notifications
if (typeof window !== 'undefined') {
  window.addEventListener('data-update', () => storeManager.notify());
  window.addEventListener('user-update', () => storeManager.notify());
  window.addEventListener('config-update', () => storeManager.notify());
}

/**
 * Advanced React 18 Hook using useSyncExternalStore with Result Stabilization.
 * Prevents infinite loops when stores return new references for identical data.
 */
export function useDataStore<T, Slice = T>(
  getData: () => T,
  selector?: (data: T) => Slice
): Slice {
  // Ref to hold the last stable result
  const resultRef = useRef<Slice>(undefined as unknown as Slice);
  const initializedRef = useRef(false);

  const getSnapshot = () => {
    // 1. Get raw data
    const data = getData();
    
    // 2. Apply selector if present
    const slice = selector ? selector(data) : (data as unknown as Slice);
    
    // 3. Initialize if first run
    if (!initializedRef.current) {
        resultRef.current = slice;
        initializedRef.current = true;
        return slice;
    }

    // 4. Compare with previous result to ensure referential stability
    // This stops React from re-rendering if the *content* hasn't changed,
    // even if the *reference* from getData() is new (e.g. from .filter()).
    if (fastDeepEqual(resultRef.current, slice)) {
      return resultRef.current;
    }

    // 5. Update ref if deep equal fails
    resultRef.current = slice;
    return slice;
  };

  return useSyncExternalStore(
    (cb) => storeManager.subscribe(cb),
    getSnapshot,
    getSnapshot // Server snapshot (same for this client-heavy app)
  );
}
