
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CONFIG } from '../../config';
import { Card } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';

const CategoryRadarChart: React.FC = () => {
  const { CHARTS } = CONFIG.THEME;
  const data = threatData.getThreatCategories();

  return (
    <Card className="p-4 shadow-lg h-80">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Threat Vector Analysis</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke={CHARTS.TOOLTIP_BORDER} />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Radar
              name="Threats"
              dataKey="value"
              stroke={CHARTS.PRIMARY}
              strokeWidth={2}
              fill={CHARTS.PRIMARY}
              fillOpacity={0.3}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: CHARTS.TOOLTIP_BG, borderColor: CHARTS.GRID, color: CHARTS.TOOLTIP_TEXT }}
              itemStyle={{ color: CHARTS.PRIMARY }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
export default CategoryRadarChart;
