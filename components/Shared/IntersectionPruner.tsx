
import React, { useRef, useEffect, useState } from 'react';

/**
 * SHOCKING PRACTICE: Intersection Pruning
 * Completely unmounts/freezes expensive children when they scroll out of view.
 * Keeps a placeholder height to prevent scroll jumping.
 */
export const IntersectionPruner: React.FC<{ 
  children: React.ReactNode; 
  height?: number | string;
  threshold?: number;
}> = ({ children, height = '300px', threshold = 0.1 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Toggle visibility based on intersection
        if (entry.isIntersecting) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
      },
      { threshold, rootMargin: '100px' } // Pre-load 100px before appearing
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={containerRef} style={{ minHeight: height }} className="relative">
      {isVisible ? children : <div className="absolute inset-0 flex items-center justify-center text-slate-800 text-[10px] uppercase font-bold tracking-widest bg-slate-950/20">Rendering Paused</div>}
    </div>
  );
};
