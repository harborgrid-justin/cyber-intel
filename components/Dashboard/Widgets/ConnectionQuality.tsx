
import React from 'react';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { Card } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
// FIX: Changed 'tokens' to 'TOKENS' to match export.
import { EXECUTIVE_THEME, TOKENS } from '../../../styles/theme';

export const ConnectionQuality: React.FC = () => {
  const { online, effectiveType, rtt, saveData } = useNetworkStatus();

  return (
    <Card className={`p-4 flex items-center justify-between ${EXECUTIVE_THEME.surfaces.card_base}`}>
      <div className="flex items-center gap-3">
        {/* FIX: Replaced invalid theme object access with CSS variables for colors. */}
        <div className={`p-2 rounded-full ${online ? 'bg-[var(--colors-successDim)] text-[var(--colors-success)]' : 'bg-[var(--colors-errorDim)] text-[var(--colors-error)]'}`}>
            <Icons.Activity className="w-5 h-5" />
        </div>
        <div>
            <div className={EXECUTIVE_THEME.typography.mono_label}>Uplink Status</div>
            <div className={`text-sm font-bold text-[var(--colors-textPrimary)] flex items-center gap-2`}>
                {online ? 'ONLINE' : 'OFFLINE'}
                <span className={`text-xs font-mono px-1 rounded border border-[var(--colors-borderSubtle)] text-[var(--colors-info)]`}>
                  {effectiveType.toUpperCase()}
                </span>
            </div>
        </div>
      </div>
      <div className="text-right text-xs">
         <div className="text-[var(--colors-textSecondary)]">RTT: <span className={`text-[var(--colors-textPrimary)] font-mono`}>{rtt}ms</span></div>
         {saveData && <div className={`text-[var(--colors-warning)] text-[9px] font-bold`}>DATA SAVER ON</div>}
      </div>
    </Card>
  );
};