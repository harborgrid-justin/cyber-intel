
import { useState, useCallback, useMemo } from 'react';

export interface UseSelectionResult<T> {
  selectedIds: Set<string>;
  selectedItems: T[];
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  select: (id: string) => void;
  deselect: (id: string) => void;
  toggle: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleAll: () => void;
  selectRange: (startId: string, endId: string) => void;
  selectMultiple: (ids: string[]) => void;
}

/**
 * Multi-select logic hook with range selection support
 */
export function useSelection<T extends { id: string }>(
  items: T[]
): UseSelectionResult<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const isAllSelected = useMemo(
    () => items.length > 0 && items.every(item => selectedIds.has(item.id)),
    [items, selectedIds]
  );

  const isSomeSelected = useMemo(
    () => items.some(item => selectedIds.has(item.id)) && !isAllSelected,
    [items, selectedIds, isAllSelected]
  );

  const selectedItems = useMemo(
    () => items.filter(item => selectedIds.has(item.id)),
    [items, selectedIds]
  );

  const select = useCallback((id: string) => {
    setSelectedIds(prev => new Set(prev).add(id));
    setLastSelectedId(id);
  }, []);

  const deselect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setLastSelectedId(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [isAllSelected, selectAll, deselectAll]);

  const selectRange = useCallback(
    (startId: string, endId: string) => {
      const startIndex = items.findIndex(item => item.id === startId);
      const endIndex = items.findIndex(item => item.id === endId);

      if (startIndex === -1 || endIndex === -1) return;

      const [min, max] = [startIndex, endIndex].sort((a, b) => a - b);
      const rangeIds = items.slice(min, max + 1).map(item => item.id);

      setSelectedIds(prev => new Set([...prev, ...rangeIds]));
    },
    [items]
  );

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(prev => new Set([...prev, ...ids]));
  }, []);

  return {
    selectedIds,
    selectedItems,
    isSelected,
    isAllSelected,
    isSomeSelected,
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    selectRange,
    selectMultiple
  };
}

/**
 * Hook for keyboard-based selection (with Shift and Ctrl/Cmd support)
 */
export function useKeyboardSelection<T extends { id: string }>(
  items: T[],
  onSelect?: (items: T[]) => void
): UseSelectionResult<T> & {
  handleClick: (id: string, event: React.MouseEvent) => void;
} {
  const selection = useSelection(items);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

  const handleClick = useCallback(
    (id: string, event: React.MouseEvent) => {
      event.preventDefault();

      if (event.shiftKey && lastClickedId) {
        // Range selection
        selection.selectRange(lastClickedId, id);
      } else if (event.ctrlKey || event.metaKey) {
        // Toggle selection
        selection.toggle(id);
      } else {
        // Single selection
        selection.deselectAll();
        selection.select(id);
      }

      setLastClickedId(id);

      if (onSelect) {
        const selected = items.filter(item => selection.isSelected(item.id));
        onSelect(selected);
      }
    },
    [lastClickedId, selection, items, onSelect]
  );

  return {
    ...selection,
    handleClick
  };
}
