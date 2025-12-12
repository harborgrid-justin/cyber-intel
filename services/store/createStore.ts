
import { Store, StoreListener, StateUpdater, Action, Middleware } from './types';

/**
 * Creates a lightweight Redux-like store with middleware support
 */
export function createStore<T>(
  initialState: T,
  middlewares: Middleware<T>[] = []
): Store<T> {
  let state = initialState;
  let listeners: Set<StoreListener> = new Set();
  let isDispatching = false;

  const getState = (): T => state;

  const setState = (updater: StateUpdater<T>): void => {
    if (isDispatching) {
      throw new Error('Cannot update state while dispatching');
    }

    const newState = typeof updater === 'function' ? updater(state) : updater;
    const nextState = { ...state, ...newState };

    if (nextState !== state) {
      state = nextState;
      notify();
    }
  };

  const subscribe = (listener: StoreListener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const notify = (): void => {
    listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in store listener:', error);
      }
    });
  };

  const dispatch = (action: Action): void => {
    if (isDispatching) {
      throw new Error('Cannot dispatch while already dispatching');
    }

    try {
      isDispatching = true;

      // Apply middleware chain
      let finalDispatch = (act: Action) => {
        // Base dispatch logic
        console.log('[Store] Action:', act.type, act.payload);
      };

      // Build middleware chain from right to left
      for (let i = middlewares.length - 1; i >= 0; i--) {
        const middleware = middlewares[i];
        const next = finalDispatch;
        finalDispatch = (act: Action) => {
          middleware({ getState, setState, subscribe, destroy })(next)(act);
        };
      }

      finalDispatch(action);
    } finally {
      isDispatching = false;
    }
  };

  const destroy = (): void => {
    listeners.clear();
  };

  return {
    getState,
    setState,
    subscribe,
    destroy,
    dispatch
  } as Store<T> & { dispatch: (action: Action) => void };
}

/**
 * Creates a slice of the store with actions and selectors
 */
export function createSlice<T, S = any>(config: {
  name: string;
  initialState: T;
  reducers: Record<string, (state: T, payload?: any) => T | Partial<T>>;
}): {
  name: string;
  initialState: T;
  actions: Record<string, (payload?: any) => Action>;
  reducer: (state: T, action: Action) => T;
} {
  const { name, initialState, reducers } = config;

  // Create action creators
  const actions: Record<string, (payload?: any) => Action> = {};
  Object.keys(reducers).forEach(key => {
    actions[key] = (payload?: any) => ({
      type: `${name}/${key}`,
      payload
    });
  });

  // Create reducer
  const reducer = (state: T = initialState, action: Action): T => {
    const actionName = action.type.split('/')[1];
    const reducerFn = reducers[actionName];

    if (reducerFn) {
      const result = reducerFn(state, action.payload);
      return { ...state, ...result };
    }

    return state;
  };

  return {
    name,
    initialState,
    actions,
    reducer
  };
}

/**
 * Combines multiple reducers into a single root reducer
 */
export function combineReducers<T extends Record<string, any>>(
  reducers: Record<keyof T, (state: any, action: Action) => any>
): (state: T, action: Action) => T {
  return (state: T, action: Action): T => {
    const nextState = {} as T;
    let hasChanged = false;

    Object.keys(reducers).forEach(key => {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    });

    return hasChanged ? nextState : state;
  };
}

/**
 * Logger middleware for development
 */
export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.group(`[Action] ${action.type}`);
  console.log('Payload:', action.payload);
  console.log('Previous State:', store.getState());
  next(action);
  console.log('Next State:', store.getState());
  console.groupEnd();
};

/**
 * Thunk middleware for async actions
 */
export const thunkMiddleware: Middleware = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store);
  }
  return next(action);
};

/**
 * Devtools middleware for time-travel debugging
 */
export const createDevtoolsMiddleware = (
  maxActions: number = 50
): Middleware => {
  const actionHistory: Array<{ action: Action; state: any; timestamp: number }> = [];

  return (store) => (next) => (action) => {
    const timestamp = Date.now();
    const previousState = store.getState();

    next(action);

    const nextState = store.getState();

    actionHistory.push({
      action,
      state: nextState,
      timestamp
    });

    // Keep only last N actions
    if (actionHistory.length > maxActions) {
      actionHistory.shift();
    }

    // Expose to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__STORE_DEVTOOLS__ = {
        history: actionHistory,
        getState: () => store.getState(),
        dispatch: (act: Action) => next(act),
        timeTravel: (index: number) => {
          if (actionHistory[index]) {
            store.setState(() => actionHistory[index].state);
          }
        }
      };
    }
  };
};

/**
 * Persistence middleware
 */
export const createPersistenceMiddleware = (
  key: string,
  storage: Storage = localStorage,
  debounceMs: number = 500
): Middleware => {
  let timeoutId: any = null;

  return (store) => (next) => (action) => {
    next(action);

    // Debounce persistence
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      try {
        const state = store.getState();
        storage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error('[Persistence] Failed to save state:', error);
      }
    }, debounceMs);
  };
};

/**
 * Load persisted state
 */
export function loadPersistedState<T>(
  key: string,
  storage: Storage = localStorage
): Partial<T> | null {
  try {
    const serialized = storage.getItem(key);
    if (serialized === null) return null;
    return JSON.parse(serialized);
  } catch (error) {
    console.error('[Persistence] Failed to load state:', error);
    return null;
  }
}
