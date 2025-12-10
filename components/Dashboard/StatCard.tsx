
import React from 'react';
import { Card } from '../Shared/UI';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'cyan' | string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, isPositive, color = "primary", onClick }) => {
  const cardStyle = {
    '--stat-color-dim': `var(--colors-${color}-dim, var(--colors-primary-dim))`
  } as React.CSSProperties;
  
  return (
    <Card onClick={onClick} className={`p-5 shadow-lg relative overflow-hidden ${onClick ? 'cursor-pointer hover:bg-[var(--colors-surfaceHighlight)] transition-colors' : ''}`} style={cardStyle}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-[var(--stat-color-dim)] rounded-full -mr-10 -mt-10 blur-xl`} />
      <h3 className="text-[var(--colors-textSecondary)] text-sm font-medium uppercase tracking-wider">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-bold text-[var(--colors-textPrimary)]">{value}</span>
        {trend && ( <span className={`ml-3 text-xs font-medium px-2 py-0.5 rounded-full ${ isPositive ? 'bg-[var(--colors-successDim)] text-[var(--colors-success)]' : 'bg-[var(--colors-errorDim)] text-[var(--colors-error)]' }`}>{trend}</span> )}
      </div>
    </Card>
  );
};
export default StatCard;
