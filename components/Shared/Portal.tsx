
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  selector?: string;
}

export const Portal: React.FC<PortalProps> = ({ children, selector = 'body' }) => {
  const [mounted, setMounted] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setElement(document.querySelector(selector) as HTMLElement);
    return () => setMounted(false);
  }, [selector]);

  if (!mounted || !element) return null;

  return createPortal(children, element);
};
