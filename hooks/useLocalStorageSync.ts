
import { useState, useEffect } from 'react';

const CURRENT_VERSION = 2; // Increment when schema changes

export function useLocalStorageSync<T>(key: string, initialValue: T) {
  // Key wrapper to include version
  const storageKey = `v${CURRENT_VERSION}_${key}`;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // Effect to clean up old versions
  useEffect(() => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        // If key matches pattern (e.g., v1_user) but version is lower
        if (k && k.includes(`_${key}`) && !k.startsWith(`v${CURRENT_VERSION}_`)) {
            keysToRemove.push(k);
        }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
      
      // Dispatch event for cross-tab sync if needed (Practice #3 could be used here)
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
