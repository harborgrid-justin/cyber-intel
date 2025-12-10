
import React, { useEffect, useRef } from 'react';

// Alerts if any child node (like a security badge) is removed or modified from the DOM
export const TamperProofContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        console.warn('[SECURITY] DOM Mutation detected on secure element:', mutation.type);
        // In a real app, this might trigger a session lock or audit log
        window.dispatchEvent(new CustomEvent('notification', { 
            detail: { title: 'Integrity Check', message: 'DOM Tampering Detected', type: 'warning' }
        }));
      });
    });

    observer.observe(containerRef.current, { 
      childList: true, 
      attributes: true, 
      subtree: true,
      characterData: true 
    });

    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef}>{children}</div>;
};
