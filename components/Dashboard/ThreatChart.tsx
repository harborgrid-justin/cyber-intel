import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

const ThreatChart: React.FC = () => {
  const CHARTS = TOKENS.dark.charts;
  
  const allThreats = useDataStore(() => threatData.getThreats(false));
  const data = useMemo(() => threatData.getThreatTrends(), [allThreats]);

  return (
    <Card className="shadow-lg h-96 p-0 overflow-hidden flex flex-col">
      <CardHeader title="Global Threat Volume (24h)" />
      <div className="flex-1 w-full min-h-0">
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
      </div>
    </Card>
  );
};
export default ThreatChart;