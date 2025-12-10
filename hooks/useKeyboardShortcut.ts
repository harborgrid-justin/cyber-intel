
import { useEffect } from 'react';

export const useKeyboardShortcut = (
  key: string, 
  callback: () => void, 
  modifiers: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean } = {}
) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        !!modifiers.ctrl === event.ctrlKey &&
        !!modifiers.alt === event.altKey &&
        !!modifiers.shift === event.shiftKey &&
        !!modifiers.meta === event.metaKey
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, modifiers]);
};
