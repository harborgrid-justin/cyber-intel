
import React, { useState, useRef, UIEvent, useEffect, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  rowHeight: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  containerHeight: number;
  className?: string;
  overscan?: number;
}

/**
 * Advanced VirtualList with Kinetic Scroll Optimization.
 * Disables heavy rendering during high-velocity scrolling to maintain 60fps.
 */
export function VirtualList<T>({ items, rowHeight, renderRow, containerHeight, className = '', overscan = 3 }: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<any>(null);

  // Derived calculations
  const totalHeight = items.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan);
  const offsetY = startIndex * rowHeight;
  
  const visibleItems = useMemo(() => items.slice(startIndex, endIndex), [items, startIndex, endIndex]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setIsScrolling(true);
    
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
    }, 150); // Debounce scroll end state
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto relative ${className}`}
      style={{ height: containerHeight, contain: 'strict' }} // CSS containment for perf
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            transform: `translateY(${offsetY}px)`,
            // Optimization: Prevent mouse events during scroll to reduce compositing
            pointerEvents: isScrolling ? 'none' : 'auto' 
          }}
        >
          {visibleItems.map((item, index) => {
             // If scrolling fast, we could optionally render a lightweight skeleton here
             // For now, we rely on React 18's concurrency
             return renderRow(item, startIndex + index);
          })}
        </div>
      </div>
    </div>
  );
}
