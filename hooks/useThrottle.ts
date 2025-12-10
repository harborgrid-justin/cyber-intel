
import { useState, useRef, useCallback } from 'react';

export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  if (Date.now() - lastRan.current >= limit) {
      setThrottledValue(value);
      lastRan.current = Date.now();
  }

  return throttledValue;
}

export function useThrottledCallback<T extends (...args: any[]) => any>(callback: T, limit: number) {
    const lastRan = useRef(0);
    
    return useCallback((...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastRan.current >= limit) {
            callback(...args);
            lastRan.current = now;
        }
    }, [callback, limit]);
}
