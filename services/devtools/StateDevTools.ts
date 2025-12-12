
import { Store, Action, DevtoolsAction } from '../store/types';

/**
 * State debugging utilities for development
 */
export class StateDevTools<T = any> {
  private actionHistory: DevtoolsAction[] = [];
  private stateHistory: T[] = [];
  private maxHistory: number;
  private enabled: boolean;

  constructor(
    private store: Store<T>,
    options: { maxHistory?: number; enabled?: boolean } = {}
  ) {
    this.maxHistory = options.maxHistory || 50;
    this.enabled = options.enabled ?? (process.env.NODE_ENV === 'development');

    if (this.enabled) {
      this.init();
    }
  }

  /**
   * Initialize devtools
   */
  private init(): void {
    // Expose to window for browser console access
    if (typeof window !== 'undefined') {
      (window as any).__SENTINEL_DEVTOOLS__ = this;
    }

    // Subscribe to state changes
    this.store.subscribe(() => {
      this.captureState();
    });

    console.log('%c[DevTools] State debugging enabled', 'color: #4CAF50; font-weight: bold');
    console.log('Access devtools via: window.__SENTINEL_DEVTOOLS__');
  }

  /**
   * Capture current state
   */
  private captureState(): void {
    const state = this.store.getState();
    this.stateHistory.push(JSON.parse(JSON.stringify(state)));

    if (this.stateHistory.length > this.maxHistory) {
      this.stateHistory.shift();
    }
  }

  /**
   * Log an action
   */
  logAction(action: Action): void {
    if (!this.enabled) return;

    const devAction: DevtoolsAction = {
      type: action.type,
      payload: action.payload,
      timestamp: Date.now(),
      state: this.store.getState()
    };

    this.actionHistory.push(devAction);

    if (this.actionHistory.length > this.maxHistory) {
      this.actionHistory.shift();
    }

    console.groupCollapsed(
      `%c[Action] ${action.type}`,
      'color: #2196F3; font-weight: bold'
    );
    console.log('%cPayload:', 'color: #FF9800', action.payload);
    console.log('%cState:', 'color: #9C27B0', this.store.getState());
    console.groupEnd();
  }

  /**
   * Get action history
   */
  getActionHistory(): DevtoolsAction[] {
    return this.actionHistory;
  }

  /**
   * Get state history
   */
  getStateHistory(): T[] {
    return this.stateHistory;
  }

  /**
   * Get current state
   */
  getCurrentState(): T {
    return this.store.getState();
  }

  /**
   * Time-travel to specific state
   */
  timeTravel(index: number): void {
    if (index >= 0 && index < this.stateHistory.length) {
      const state = this.stateHistory[index];
      this.store.setState(() => state);
      console.log(`%c[DevTools] Time-traveled to state #${index}`, 'color: #4CAF50');
    } else {
      console.error(`[DevTools] Invalid state index: ${index}`);
    }
  }

  /**
   * Jump to action state
   */
  jumpToAction(index: number): void {
    if (index >= 0 && index < this.actionHistory.length) {
      const action = this.actionHistory[index];
      this.store.setState(() => action.state as T);
      console.log(`%c[DevTools] Jumped to action #${index}: ${action.type}`, 'color: #4CAF50');
    } else {
      console.error(`[DevTools] Invalid action index: ${index}`);
    }
  }

  /**
   * Export state as JSON
   */
  exportState(): string {
    return JSON.stringify(this.store.getState(), null, 2);
  }

  /**
   * Import state from JSON
   */
  importState(json: string): void {
    try {
      const state = JSON.parse(json);
      this.store.setState(() => state);
      console.log('%c[DevTools] State imported successfully', 'color: #4CAF50');
    } catch (error) {
      console.error('[DevTools] Failed to import state:', error);
    }
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.actionHistory = [];
    this.stateHistory = [];
    console.log('%c[DevTools] History cleared', 'color: #4CAF50');
  }

  /**
   * Diff two states
   */
  diff(index1: number, index2: number): any {
    if (
      index1 >= 0 &&
      index1 < this.stateHistory.length &&
      index2 >= 0 &&
      index2 < this.stateHistory.length
    ) {
      const state1 = this.stateHistory[index1];
      const state2 = this.stateHistory[index2];
      return this.deepDiff(state1, state2);
    }
    return null;
  }

  /**
   * Deep diff helper
   */
  private deepDiff(obj1: any, obj2: any): any {
    const changes: any = {};

    // Check obj1 keys
    Object.keys(obj1).forEach(key => {
      if (!(key in obj2)) {
        changes[key] = { removed: obj1[key] };
      } else if (obj1[key] !== obj2[key]) {
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
          const nested = this.deepDiff(obj1[key], obj2[key]);
          if (Object.keys(nested).length > 0) {
            changes[key] = nested;
          }
        } else {
          changes[key] = { from: obj1[key], to: obj2[key] };
        }
      }
    });

    // Check obj2 keys for additions
    Object.keys(obj2).forEach(key => {
      if (!(key in obj1)) {
        changes[key] = { added: obj2[key] };
      }
    });

    return changes;
  }

  /**
   * Print statistics
   */
  printStats(): void {
    console.group('%c[DevTools] Statistics', 'color: #4CAF50; font-weight: bold');
    console.log('Actions logged:', this.actionHistory.length);
    console.log('States captured:', this.stateHistory.length);
    console.log('Max history:', this.maxHistory);

    // Action frequency
    const actionCounts: Record<string, number> = {};
    this.actionHistory.forEach(action => {
      actionCounts[action.type] = (actionCounts[action.type] || 0) + 1;
    });

    console.log('Action frequency:');
    console.table(
      Object.entries(actionCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => ({ type, count }))
    );

    console.groupEnd();
  }

  /**
   * Find actions by type
   */
  findActions(type: string): DevtoolsAction[] {
    return this.actionHistory.filter(action => action.type.includes(type));
  }

  /**
   * Replay actions
   */
  replayActions(startIndex: number = 0, endIndex?: number): void {
    const actions = this.actionHistory.slice(
      startIndex,
      endIndex || this.actionHistory.length
    );

    console.log(`%c[DevTools] Replaying ${actions.length} actions...`, 'color: #4CAF50');

    actions.forEach((action, index) => {
      setTimeout(() => {
        (this.store as any).dispatch?.({
          type: action.type,
          payload: action.payload
        });
      }, index * 100); // 100ms delay between actions
    });
  }

  /**
   * Enable/disable devtools
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(
      `%c[DevTools] ${enabled ? 'Enabled' : 'Disabled'}`,
      'color: #4CAF50'
    );
  }
}

/**
 * Logger middleware with devtools integration
 */
export function createDevToolsLogger<T = any>(
  devtools: StateDevTools<T>
): (store: Store<T>) => (next: (action: Action) => void) => (action: Action) => void {
  return (store) => (next) => (action) => {
    devtools.logAction(action);
    next(action);
  };
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  private measurements: Map<string, number[]> = new Map();

  /**
   * Start measuring
   */
  start(label: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.record(label, duration);
    };
  }

  /**
   * Record measurement
   */
  private record(label: string, duration: number): void {
    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }

    const measurements = this.measurements.get(label)!;
    measurements.push(duration);

    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }

    // Warn on slow operations
    if (duration > 16.67) {
      // > 1 frame at 60fps
      console.warn(
        `%c[Performance] Slow operation: ${label} took ${duration.toFixed(2)}ms`,
        'color: #FF9800'
      );
    }
  }

  /**
   * Get statistics for a label
   */
  getStats(label: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    median: number;
  } | null {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) return null;

    const sorted = [...measurements].sort((a, b) => a - b);
    const count = measurements.length;
    const avg = measurements.reduce((a, b) => a + b, 0) / count;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = sorted[Math.floor(count / 2)];

    return { count, avg, min, max, median };
  }

  /**
   * Print all statistics
   */
  printStats(): void {
    console.group('%c[Performance] Statistics', 'color: #4CAF50; font-weight: bold');

    this.measurements.forEach((_, label) => {
      const stats = this.getStats(label);
      if (stats) {
        console.log(`${label}:`, {
          ...stats,
          avg: `${stats.avg.toFixed(2)}ms`,
          min: `${stats.min.toFixed(2)}ms`,
          max: `${stats.max.toFixed(2)}ms`,
          median: `${stats.median.toFixed(2)}ms`
        });
      }
    });

    console.groupEnd();
  }

  /**
   * Clear measurements
   */
  clear(): void {
    this.measurements.clear();
  }
}

/**
 * Global performance monitor
 */
export const perfMonitor = new PerformanceMonitor();
