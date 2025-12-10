
import React from 'react';

interface BreadcrumbsProps {
  items: { label: string; onClick?: () => void }[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="mx-2 text-slate-600">/</span>}
          <button 
            onClick={item.onClick}
            disabled={!item.onClick}
            className={`${item.onClick ? 'hover:text-cyan-400 cursor-pointer transition-colors' : 'cursor-default text-slate-400'}`}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};
