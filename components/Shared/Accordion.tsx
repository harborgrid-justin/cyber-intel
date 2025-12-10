
import React, { useState } from 'react';
import { Icons } from './Icons';

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-slate-800 rounded bg-slate-900/30 overflow-hidden ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex justify-between items-center bg-slate-900 hover:bg-slate-800 transition-colors"
      >
        <div className="font-bold text-sm text-slate-200">{title}</div>
        <Icons.Shuffle className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-slate-800 animate-in slide-in-from-top-2">
          {children}
        </div>
      )}
    </div>
  );
};
