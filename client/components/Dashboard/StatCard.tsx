
import React from 'react';
import { Card } from '../Shared/UI';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
  color?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, isPositive, color = "cyan", onClick }) => {
  return (
    <Card 
      onClick={onClick} 
      className={`p-5 shadow-lg relative overflow-hidden ${onClick ? 'cursor-pointer hover:bg-slate-800/80 transition-colors' : ''}`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -mr-10 -mt-10 blur-xl`} />
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-bold text-white">{value}</span>
        {trend && (
          <span className={`ml-3 text-xs font-medium px-2 py-0.5 rounded-full ${
            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </Card>
  );
};
export default StatCard;
