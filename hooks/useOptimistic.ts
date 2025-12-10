
import { useState, useCallback } from 'react';

/**
 * SHOCKING PRACTICE: Generic Optimistic UI State
 * Updates local state instantly, waits for promise, rolls back on error.
 */
export function useOptimistic<T>(
  initialState: T,
  mutationFn: (newValue: T) => Promise<void>
) {
  const [state, setState] = useState<T>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (newValue: T) => {
    const previousState = state;
    
    // 1. Optimistic Update
    setState(newValue);
    setIsPending(true);
    setError(null);

    try {
      // 2. Perform Async Mutation
      await mutationFn(newValue);
      setIsPending(false);
    } catch (err) {
      // 3. Automatic Rollback on Failure
      console.error("Optimistic update failed, rolling back.", err);
      setState(previousState);
      setError(err as Error);
      setIsPending(false);
    }
  }, [state, mutationFn]);

  return { state, mutate, isPending, error };
}
