
import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  isActive?: boolean;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ children, isActive = true }) => {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const focusable = root.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusable && focusable.length > 0) {
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      first.focus();
      root.current?.addEventListener('keydown', handleTab);
      return () => root.current?.removeEventListener('keydown', handleTab);
    }
  }, [isActive]);

  return <div ref={root}>{children}</div>;
};
