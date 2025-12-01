
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CONFIG } from '../../config';
import { Card, CardHeader } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';

const CategoryRadarChart: React.FC = () => {
  const { CHARTS } = CONFIG.THEME;
  const data = threatData.getThreatCategories();

  return (
    <Card className="shadow-lg h-80 p-0 overflow-hidden flex flex-col">
      <CardHeader title="Threat Vector Analysis" />
      <div className="flex-1 w-full min-h-0 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
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
