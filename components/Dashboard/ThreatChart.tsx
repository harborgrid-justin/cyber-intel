
import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface ThreatChartProps {
  className?: string;
}

const ThreatChart: React.FC<ThreatChartProps> = ({ className = '' }) => {
  const CHARTS = TOKENS.dark.charts;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allThreats = useDataStore(() => threatData.getThreats(false));
  const data = useMemo(() => {
    try {
      const trendData = threatData.getThreatTrends();
      if (!trendData || trendData.length === 0) {
        // Return empty data gracefully
        return [];
      }
      return trendData;
    } catch (err) {
      setError('Failed to load threat trend data');
      return [];
    }
  }, [allThreats]);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className={`shadow-lg h-96 p-0 overflow-hidden flex flex-col ${className}`}>
      <CardHeader title="Global Threat Volume (24h)" />
      <div className="flex-1 w-full min-h-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-3" style={{ borderColor: CHARTS.primary }} />
              <p className="text-sm text-[var(--colors-textSecondary)]">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-4">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-sm font-bold text-[var(--colors-error)] mb-2">{error}</p>
              <p className="text-xs text-[var(--colors-textSecondary)]">Please try refreshing the page</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-4">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-sm font-bold text-[var(--colors-textPrimary)] mb-2">No Data Available</p>
              <p className="text-xs text-[var(--colors-textSecondary)]">Threat data will appear here once available</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHARTS.primary} stopOpacity={0.3}/><stop offset="95%" stopColor={CHARTS.primary} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHARTS.grid} />
                <XAxis dataKey="name" stroke={CHARTS.text} fontSize={12} tickLine={false} />
                <YAxis stroke={CHARTS.text} fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: CHARTS.tooltipBg, borderColor: CHARTS.tooltipBorder, color: CHARTS.tooltipText }} itemStyle={{ color: CHARTS.primary }} />
                <Area type="monotone" dataKey="value" stroke={CHARTS.primary} fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};
export default ThreatChart;
