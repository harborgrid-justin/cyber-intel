import React, { useReducer, useRef, useCallback } from 'react';

type Middleware<S, A> = (store: { getState: () => S; dispatch: React.Dispatch<A> }) => (next: React.Dispatch<A>) => (action: A) => void;

export function useMiddlewareReducer<S, A>(
  reducer: React.Reducer<S, A>,
  initialState: S,
  middlewares: Middleware<S, A>[] = []
) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state; // Keep ref updated for middleware access

  const dispatchWithMiddleware = useCallback((action: A) => {
    const store = {
      getState: () => stateRef.current,
      dispatch: (act: A) => dispatch(act) // recursively allow dispatch
    };

    const chain = middlewares.map(middleware => middleware(store));
    const composed = chain.reduceRight((next, mw) => mw(next), dispatch);
    
    composed(action);
  }, [middlewares]);

  return [state, dispatchWithMiddleware] as const;
}

// Example Logger Middleware
export const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
    console.debug('[Dispatch]', action);
    console.debug('[Prev State]', store.getState());
    next(action);
    // Note: Can't log next state easily here without async or effect, as react state updates are scheduled
};