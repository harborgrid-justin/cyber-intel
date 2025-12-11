
import React from 'react';
import { Threat, Severity } from '../../types';
import { Icons } from './Icons';
import { EXECUTIVE_THEME, TOKENS } from '../../styles/theme';

interface AlertTickerProps {
  threats: Threat[];
}

const AlertTicker: React.FC<AlertTickerProps> = ({ threats }) => {
  const criticals = threats.filter(t => t.severity === Severity.CRITICAL || t.severity === Severity.HIGH);
  if (criticals.length === 0) return null;

  return (
    <div className={`w-full bg-[var(--colors-errorDim)] border-y border-[var(--colors-error)] overflow-hidden flex items-center h-8 relative group z-40`}>
      <div className={`absolute left-0 z-10 bg-rose-950/90 backdrop-blur px-3 h-full flex items-center text-[10px] font-bold text-rose-400 uppercase tracking-widest border-r border-[var(--colors-error)] shadow-lg`}>
        <Icons.AlertTriangle className="w-3 h-3 mr-2 animate-pulse text-rose-500" />
        Live Intel
      </div>
      <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] group-hover:[animation-play-state:paused] items-center">
        {criticals.map((t, i) => ( <div key={`${t.id}-${i}`} className="flex items-center mx-6 text-xs font-mono text-rose-200/80"><span className="text-rose-400 font-bold mr-2">[{t.severity}]</span> {t.description}</div> ))}
      </div>
    </div>
  );
};

export default AlertTicker;
