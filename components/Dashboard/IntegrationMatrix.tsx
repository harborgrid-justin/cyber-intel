
import React from 'react';
import { Card, SectionHeader, StatusIndicator } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { IntegrationMetric } from '../../types';
import { useIntegrationMetrics } from '../../hooks/modules/useIntegrationMetrics';

// Pure Component for Cell
const MatrixCell = React.memo<{ metric: IntegrationMetric }>(({ metric }) => {
    const IconComponent = (Icons as any)[metric.icon] || Icons.Activity;
    
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CRITICAL': return `bg-[var(--colors-errorDim)] border-[var(--colors-error)] text-[var(--colors-error)]`;
            case 'WARNING': return `bg-[var(--colors-warningDim)] border-[var(--colors-warning)] text-[var(--colors-warning)]`;
            case 'ACTIVE': return `bg-[var(--colors-infoDim)] border-[var(--colors-info)] text-[var(--colors-info)]`;
            case 'MITIGATING': return `bg-[var(--colors-infoDim)] border-[var(--colors-info)] text-[var(--colors-info)]`;
            case 'SECURE': return `bg-[var(--colors-successDim)] border-[var(--colors-success)] text-[var(--colors-success)]`;
            case 'MONITORING': return `bg-purple-900/20 border-purple-500 text-purple-400 border`;
            case 'IDLE': 
            default: 
                return `bg-slate-900/20 border border-dashed border-slate-800/50 text-slate-500 hover:border-slate-600 hover:bg-slate-800/30 hover:text-slate-300`;
        }
    };

    const baseClass = getStatusStyle(metric.status);

    return (
        <div className={`p-2 rounded flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 min-h-[80px] ${baseClass}`}>
            <IconComponent className="w-4 h-4 mb-1" />
            <div className="text-[9px] font-bold text-center leading-tight opacity-90">{metric.name}</div>
            <div className="text-xs font-mono font-bold">{metric.value}</div>
            <StatusIndicator 
                color={metric.status === 'CRITICAL' ? 'red' : metric.status === 'WARNING' ? 'orange' : metric.status === 'ACTIVE' ? 'cyan' : 'slate'} 
                pulse={metric.status === 'CRITICAL' || metric.status === 'WARNING' || metric.status === 'ACTIVE'}
                className="w-1.5 h-1.5 mt-1"
            />
        </div>
    );
});

export const IntegrationMatrix: React.FC = () => {
  // Logic extracted to hook
  const metrics = useIntegrationMetrics();

  return (
    <Card className="p-0 overflow-hidden mt-6">
      <SectionHeader title="System Integration Synapse" subtitle="Cross-Module Data Fusion Status" />
      <div className="p-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {metrics.map(m => (
          <MatrixCell key={m.id} metric={m} />
        ))}
      </div>
    </Card>
  );
};
