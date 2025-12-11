
import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { TOKENS } from '../../styles/theme';

const CategoryRadarChart: React.FC = () => {
  const CHARTS = TOKENS.dark.charts;
  
  // Subscribe to threats so the chart updates when new items are ingested/added
  const threats = useDataStore(() => threatData.getThreats(false));

  const data = useMemo(() => {
    return threatData.getThreatCategories();
  }, [threats]);

  return (
    <Card className="shadow-lg h-80 p-0 overflow-hidden flex flex-col">
      <CardHeader title="Threat Vector Analysis" />
      <div className="flex-1 w-full min-h-0">
        <div className="w-full h-full p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke={CHARTS.tooltipBorder} />
                <PolarAngleAxis dataKey="name" tick={{ fill: CHARTS.text, fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name="Threats"
                  dataKey="value"
                  stroke={CHARTS.primary}
                  strokeWidth={2}
                  fill={CHARTS.primary}
                  fillOpacity={0.3}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: CHARTS.tooltipBg, borderColor: CHARTS.grid, color: CHARTS.tooltipText }}
                  itemStyle={{ color: CHARTS.primary }}
                />
              </RadarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
export default CategoryRadarChart;
