
import { useState, useCallback, useRef } from 'react';

export interface UseUndoOptions<T> {
  maxHistory?: number;
  captureOnChange?: boolean;
}

export interface UseUndoResult<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState: T) => void;
  clear: () => void;
  history: T[];
  currentIndex: number;
  goToState: (index: number) => void;
}

/**
 * Undo/redo functionality hook with time-travel support
 */
export function useUndo<T>(
  initialState: T,
  options: UseUndoOptions<T> = {}
): UseUndoResult<T> {
  const { maxHistory = 50, captureOnChange = true } = options;

  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  const state = history[currentIndex];

  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      // Don't add to history if this is from undo/redo
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        return;
      }

      setHistory((prev) => {
        const current = prev[currentIndex];
        const next =
          typeof newState === 'function'
            ? (newState as (prev: T) => T)(current)
            : newState;

        // Don't add if state hasn't changed
        if (JSON.stringify(current) === JSON.stringify(next)) {
          return prev;
        }

        // Remove any future history (if we're not at the end)
        const newHistory = prev.slice(0, currentIndex + 1);

        // Add new state
        newHistory.push(next);

        // Limit history size
        if (newHistory.length > maxHistory) {
          newHistory.shift();
          setCurrentIndex((prevIndex) => prevIndex); // Adjust index
        } else {
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }

        return newHistory;
      });
    },
    [currentIndex, maxHistory]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoRedoRef.current = true;
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const reset = useCallback((newState: T) => {
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  const clear = useCallback(() => {
    setHistory([state]);
    setCurrentIndex(0);
  }, [state]);

  const goToState = useCallback(
    (index: number) => {
      if (index >= 0 && index < history.length) {
        isUndoRedoRef.current = true;
        setCurrentIndex(index);
      }
    },
    [history.length]
  );

  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    clear,
    history,
    currentIndex,
    goToState
  };
}

/**
 * Keyboard shortcut support for undo/redo
 */
export function useUndoShortcuts<T>(undoResult: UseUndoResult<T>): void {
  const { undo, redo } = undoResult;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (modifier && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (
        modifier &&
        (event.key === 'y' || (event.key === 'z' && event.shiftKey))
      ) {
        event.preventDefault();
        redo();
      }
    },
    [undo, redo]
  );

  // This would need to be used with useEffect in the component
  // For now, we return the handler that can be attached
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }
}
