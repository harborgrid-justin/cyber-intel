
import React, { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  action: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  // Adjust position if close to edge
  const style = {
    top: y,
    left: x,
  };

  return (
    <div 
      ref={ref}
      style={style} 
      className="fixed z-50 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-75 overflow-hidden"
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.action(); onClose(); }}
          className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors ${item.danger ? 'text-red-400 hover:bg-red-900/20' : 'text-slate-300 hover:text-white'}`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
};
