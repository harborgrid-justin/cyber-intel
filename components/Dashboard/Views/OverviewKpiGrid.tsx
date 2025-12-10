
import React from 'react';
import { Card, Grid, MetricValue } from '../../Shared/UI';
import { MetricCard } from '../../Shared/MetricCard';
import { View } from '../../../types';
import { CardSkeleton } from '../../Shared/Skeleton';
import { STYLES, EXECUTIVE_THEME } from '../../../styles/theme';

interface OverviewKpiGridProps {
  loading: boolean;
  trend: { count: number; delta: number; trend: 'UP' | 'DOWN' };
  cases: any[];
  defcon: { level: number; label: string; color: string };
  reports: any[];
  handleNavigate: (view: View) => void;
  getDefconColor: (level: number) => string;
}

export const OverviewKpiGrid: React.FC<OverviewKpiGridProps> = ({ 
    loading, trend, cases, defcon, reports, handleNavigate, getDefconColor 
}) => {
    if (loading) return <Grid cols={4}><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></Grid>;

    const defconColor = getDefconColor(defcon.level);
    
    let borderColor = 'border-slate-700';
    if (defconColor === 'red') borderColor = 'border-rose-500';
    if (defconColor === 'orange') borderColor = 'border-amber-500';
    if (defconColor === 'yellow') borderColor = 'border-yellow-500';
    if (defconColor === 'green') borderColor = 'border-emerald-500';

    return (
        <Grid cols={4} className="gap-6">
            <MetricCard 
                onClick={() => handleNavigate(View.FEED)} 
                title="Global Threat Volume" 
                value={trend.count.toString()} 
                trend={`${trend.delta > 0 ? '+' : ''}${trend.delta} vs 24h`} 
                isPositive={trend.trend === 'DOWN'} 
                color="red" 
                icon="Activity" 
                className="h-full"
            />
            <MetricCard 
                onClick={() => handleNavigate(View.CASES)} 
                title="Active Investigations" 
                value={cases.filter(c => c.status !== 'CLOSED').length.toString()} 
                subValue={`${cases.filter(c => c.priority === 'CRITICAL').length} Critical Priority`}
                color="blue" 
                icon="Layers" 
                className="h-full"
            />
            <Card className={`p-6 border-l-4 ${borderColor} flex flex-col justify-between h-full bg-[var(--colors-surfaceDefault)] shadow-sm`}>
                <div className={EXECUTIVE_THEME.typography.mono_label}>Defcon Status</div>
                <div className="flex items-center gap-4 mt-2">
                    <MetricValue className={defcon.color}>{defcon.level}</MetricValue>
                    <div className="flex flex-col">
                        <span className={`text-sm font-bold ${defcon.color} tracking-tight`}>{defcon.label}</span>
                        <span className={`text-[10px] text-[var(--colors-textSecondary)] mt-0.5`}>System Wide Alert</span>
                    </div>
                </div>
            </Card>
            <MetricCard 
                onClick={() => handleNavigate(View.REPORTS)} 
                title="Intel Products" 
                value={reports.length.toString()} 
                color="purple" 
                icon="FileText" 
                subValue="Reports Generated"
                className="h-full"
            />
        </Grid>
    );
};
