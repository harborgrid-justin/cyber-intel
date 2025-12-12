
import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface ThreatLocation {
  country: string;
  lat: number;
  lng: number;
  count: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ThreatHeatmapProps {
  threats?: ThreatLocation[];
  className?: string;
}

const ThreatHeatmap: React.FC<ThreatHeatmapProps> = ({ threats, className = '' }) => {
  const CHARTS = TOKENS.dark.charts;
  const GRAPH = TOKENS.dark.graph;

  const data = useMemo(() => {
    if (!threats || threats.length === 0) {
      // Mock data for demonstration
      return [
        { country: 'USA', lat: 40, lng: -100, count: 145, severity: 'CRITICAL', size: 1000 },
        { country: 'China', lat: 35, lng: 105, count: 98, severity: 'HIGH', size: 700 },
        { country: 'Russia', lat: 60, lng: 100, count: 87, severity: 'HIGH', size: 650 },
        { country: 'UK', lat: 52, lng: 0, count: 56, severity: 'MEDIUM', size: 450 },
        { country: 'Germany', lat: 51, lng: 10, count: 43, severity: 'MEDIUM', size: 350 },
        { country: 'Brazil', lat: -10, lng: -55, count: 34, severity: 'MEDIUM', size: 280 },
        { country: 'India', lat: 20, lng: 77, count: 67, severity: 'HIGH', size: 550 },
        { country: 'Japan', lat: 36, lng: 138, count: 29, severity: 'LOW', size: 220 },
        { country: 'Australia', lat: -25, lng: 135, count: 18, severity: 'LOW', size: 150 },
        { country: 'South Africa', lat: -29, lng: 24, count: 21, severity: 'MEDIUM', size: 180 }
      ];
    }

    return threats.map(t => ({
      ...t,
      size: t.count * 7 // Scale for visualization
    }));
  }, [threats]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return GRAPH.threatCritical;
      case 'HIGH': return GRAPH.threatHigh;
      case 'MEDIUM': return GRAPH.threatMedium;
      default: return CHARTS.primary;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: CHARTS.tooltipBg,
          border: `1px solid ${CHARTS.tooltipBorder}`,
          padding: '12px',
          borderRadius: '6px'
        }}>
          <p style={{ color: CHARTS.tooltipText, fontWeight: 'bold', marginBottom: '4px' }}>
            {data.country}
          </p>
          <p style={{ color: CHARTS.tooltipText, fontSize: '12px' }}>
            Threats: <span style={{ color: getSeverityColor(data.severity), fontWeight: 'bold' }}>{data.count}</span>
          </p>
          <p style={{ color: CHARTS.tooltipText, fontSize: '12px' }}>
            Severity: <span style={{ color: getSeverityColor(data.severity) }}>{data.severity}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`shadow-lg h-96 p-0 overflow-hidden flex flex-col ${className}`}>
      <CardHeader title="Global Threat Heatmap" subtitle="Geographic Distribution" />
      <div className="flex-1 w-full min-h-0">
        <div className="w-full h-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHARTS.grid} />
              <XAxis
                type="number"
                dataKey="lng"
                domain={[-180, 180]}
                stroke={CHARTS.text}
                fontSize={11}
                tickFormatter={(value) => `${value}°`}
                label={{ value: 'Longitude', position: 'insideBottom', offset: -10, fill: CHARTS.text }}
              />
              <YAxis
                type="number"
                dataKey="lat"
                domain={[-90, 90]}
                stroke={CHARTS.text}
                fontSize={11}
                tickFormatter={(value) => `${value}°`}
                label={{ value: 'Latitude', angle: -90, position: 'insideLeft', fill: CHARTS.text }}
              />
              <ZAxis type="number" dataKey="size" range={[100, 1000]} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={data} fillOpacity={0.8}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="px-4 pb-3 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GRAPH.threatCritical }} />
          <span style={{ color: CHARTS.text }}>Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GRAPH.threatHigh }} />
          <span style={{ color: CHARTS.text }}>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GRAPH.threatMedium }} />
          <span style={{ color: CHARTS.text }}>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHARTS.primary }} />
          <span style={{ color: CHARTS.text }}>Low</span>
        </div>
      </div>
    </Card>
  );
};

export default ThreatHeatmap;
