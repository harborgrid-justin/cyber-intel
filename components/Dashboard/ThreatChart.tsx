
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { THREAT_TRENDS } from '../../constants';
import { CONFIG } from '../../config';
import { Card } from '../Shared/UI';

const ThreatChart: React.FC = () => {
  const { CHARTS } = CONFIG.THEME;

  return (
    <Card className="p-6 shadow-lg h-96">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Global Threat Volume (24h)</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={THREAT_TRENDS}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHARTS.PRIMARY} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={CHARTS.PRIMARY} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHARTS.GRID} />
            <XAxis dataKey="name" stroke={CHARTS.TEXT} fontSize={12} tickLine={false} />
            <YAxis stroke={CHARTS.TEXT} fontSize={12} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: CHARTS.TOOLTIP_BG, borderColor: CHARTS.TOOLTIP_BORDER, color: CHARTS.TOOLTIP_TEXT }}
              itemStyle={{ color: CHARTS.PRIMARY }}
            />
            <Area type="monotone" dataKey="value" stroke={CHARTS.PRIMARY} fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
export default ThreatChart;
    