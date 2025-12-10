
import { useEffect, useRef, useCallback } from 'react';

/**
 * Returns a function that returns true if the component is mounted, false otherwise.
 * Useful for preventing state updates on unmounted components during async operations.
 */
export const useIsMounted = (): () => boolean => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
};
