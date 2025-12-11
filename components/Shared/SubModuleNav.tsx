
import React from 'react';
import { TOKENS } from '../../styles/theme';

interface SubModuleNavProps {
  modules: string[];
  activeModule: string;
  onChange: (module: string) => void;
}

const SubModuleNav: React.FC<SubModuleNavProps> = ({ modules, activeModule, onChange }) => {
  return (
    <div className="w-full border-b border-slate-800 bg-slate-950/50 overflow-x-auto shrink-0 scrollbar-hide">
      <div className="flex px-4 md:px-6 min-w-max">
        {modules.map((mod) => (
          <button
            key={mod}
            onClick={() => onChange(mod)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all duration-200 ${
              activeModule === mod
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
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
