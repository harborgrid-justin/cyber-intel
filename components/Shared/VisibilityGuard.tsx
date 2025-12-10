
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  onVisible?: () => void;
  children: React.ReactNode;
}

export const VisibilityGuard: React.FC<Props> = ({ onVisible, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [fullyVisible, setFullyVisible] = useState(false);

  useEffect(() => {
    // Check for V2 support
    const supportsV2 = 'IntersectionObserver' in window && 
                       'IntersectionObserverEntry' in window && 
                       'isVisible' in IntersectionObserverEntry.prototype;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // V2 check: isVisible (un-occluded) vs V1 isIntersecting
        const isVis = supportsV2 ? (entry as any).isVisible : entry.isIntersecting;
        
        if (isVis) {
          setFullyVisible(true);
          if (onVisible) onVisible();
        } else {
          setFullyVisible(false);
        }
      });
    }, { 
      threshold: 1.0, 
      trackVisibility: true, 
      delay: 100 // V2 requires delay >= 100
    } as any);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onVisible]);

  return (
    <div ref={ref} className={`relative ${fullyVisible ? '' : 'opacity-50 grayscale transition-all'}`}>
      {children}
      {!fullyVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
          <span className="text-[10px] bg-black text-white px-1">OBSCURED</span>
        </div>
      )}
    </div>
  );
};
