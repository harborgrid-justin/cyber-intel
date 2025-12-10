
import React, { useState } from 'react';
import { Card } from '../../Shared/UI';
import { useInterval } from '../../../hooks/useInterval';
import { EXECUTIVE_THEME, TOKENS } from '../../../styles/theme';

export const ClockWidget: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useInterval(() => {
    setTime(new Date());
  }, 1000);

  const formattedTime = time.toLocaleTimeString('en-US', { hour12: false });
  const [hours, minutes, seconds] = formattedTime.split(':');

  return (
    <Card className={`p-4 flex flex-col items-center justify-center ${EXECUTIVE_THEME.surfaces.card_base} border-slate-800`}>
        <div className="flex items-baseline gap-1 font-mono text-slate-300">
            <span className="text-3xl font-bold text-white tracking-widest">{hours}:{minutes}</span>
            <span className="text-lg text-slate-500">{seconds}</span>
            <span className="text-[10px] text-cyan-500 font-bold ml-1">ZULU</span>
        </div>
        <div className="w-full h-px bg-slate-800 my-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyan-500/50 w-1/2 animate-[shimmer_2s_infinite]"></div>
        </div>
        <div className={`text-[10px] text-[var(--colors-textSecondary)] uppercase font-bold tracking-[0.2em]`}>
            {time.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
    </Card>
  );
};