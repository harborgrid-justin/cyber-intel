
import React from 'react';
import { Card, ProgressBar } from './UI';
import { Icons } from './Icons';
import { EXECUTIVE_THEME } from '../../styles/theme';
import { fastDeepEqual } from '../../services/utils/fastDeepEqual';

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  icon?: keyof typeof Icons;
  progress?: number;
  color?: 'cyan' | 'red' | 'orange' | 'green' | 'blue' | 'purple' | 'slate' | 'indigo';
  trend?: string;
  isPositive?: boolean;
  onClick?: () => void;
  className?: string;
}

const MetricCardComponent: React.FC<MetricCardProps> = ({ 
  title, value, subValue, icon, progress, color = 'blue', trend, isPositive, onClick, className = '' 
}) => {
  const IconComponent = icon ? Icons[icon] : null;
  const colorClass = color || 'blue';

  const Content = (
    <>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2">
            {IconComponent && (
                <div className={`p-1.5 rounded-md bg-[var(--colors-${colorClass}Dim)] border border-[var(--colors-${colorClass})] text-[var(--colors-${colorClass})]`} aria-hidden="true">
                    <IconComponent className="w-4 h-4" />
                </div>
            )}
            <span className={`text-sm font-medium text-[var(--colors-textSecondary)]`}>{title}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 relative z-10 text-left">
        <div className={EXECUTIVE_THEME.typography.value_huge}>{value}</div>
        
        <div className="flex items-center gap-2 min-h-[20px]">
            {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isPositive ? 'text-[var(--colors-success)] bg-[var(--colors-successDim)] border-[var(--colors-success)]' : 'text-[var(--colors-error)] bg-[var(--colors-errorDim)] border-[var(--colors-error)]'}`}>
                {trend}
            </span>
            )}
            {subValue && <span className={`text-xs text-[var(--colors-textSecondary)]`}>{subValue}</span>}
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4 relative z-10" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
           <ProgressBar value={progress} color={color as any} className="h-1" />
        </div>
      )}
      
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--colors-textPrimary)]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
    </>
  );

  if (onClick) {
      return (
          <button 
            onClick={onClick}
            className={`${className} text-left w-full h-full p-0 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] rounded-[var(--components-card-radius)]`}
            aria-label={`${title}: ${value}`}
          >
            <Card className={`p-6 flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer hover:border-[var(--colors-borderHighlight)] transition-colors`} noPadding>
                {Content}
            </Card>
          </button>
      );
  }

  return (
    <Card className={`p-6 flex flex-col justify-between h-full relative overflow-hidden group ${className}`}>
      {Content}
    </Card>
  );
};

export const MetricCard = React.memo(MetricCardComponent, fastDeepEqual);
