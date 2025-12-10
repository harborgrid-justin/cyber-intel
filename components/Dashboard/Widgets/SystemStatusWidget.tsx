
import React from 'react';
import { Card } from '../../Shared/UI';
import { EXECUTIVE_THEME, TOKENS } from '../../../styles/theme';

export const SystemStatusWidget: React.FC<{ status: string; latency: number }> = ({ status, latency }) => {
  const isOnline = status === 'ONLINE';
  return (
    <Card className={`p-4 flex justify-between items-center ${EXECUTIVE_THEME.surfaces.card_base}`}>
        <div>
            <div className={EXECUTIVE_THEME.typography.mono_label}>System Status</div>
            <div className={`text-lg font-bold ${isOnline ? 'text-[var(--colors-success)]' : 'text-[var(--colors-error)]'}`}>
              {status}
            </div>
        </div>
        <div className="text-right">
            <div className={EXECUTIVE_THEME.typography.mono_label}>API Latency</div>
            <div className={`text-lg font-mono text-[var(--colors-info)]`}>{latency}ms</div>
        </div>
    </Card>
  );
};