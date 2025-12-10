import React from 'react';
import { TOKENS } from '../../styles/theme';

interface SubModuleNavProps {
  modules: string[];
  activeModule: string;
  onChange: (module: string) => void;
}

const SubModuleNav: React.FC<SubModuleNavProps> = ({ modules, activeModule, onChange }) => {
  return (
    <div className="w-full border-b border-[var(--colors-borderDefault)] bg-[var(--colors-surfaceDefault)]/50 overflow-x-auto shrink-0 scrollbar-hide">
      <div className="flex px-4 md:px-6 min-w-max">
        {modules.map((mod) => (
          <button
            key={mod}
            onClick={() => onChange(mod)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all duration-200 ${
              activeModule === mod
                ? 'border-[var(--colors-primary)] text-[var(--colors-primary)]'
                : 'border-transparent text-[var(--colors-textSecondary)] hover:text-[var(--colors-textPrimary)] hover:bg-[var(--colors-surfaceHighlight)]'
            }`}
          >
            {mod}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubModuleNav;
