
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface TimelineDataPoint {
  timestamp: Date;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface TimelineChartProps {
  data?: TimelineDataPoint[];
  range?: '24h' | '7d' | '30d' | '90d';
  className?: string;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ data, range = '24h', className = '' }) => {
  const CHARTS = TOKENS.dark.charts;
  const GRAPH = TOKENS.dark.graph;

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate mock temporal data
      const mockData = [];
      const now = new Date();
      const points = range === '24h' ? 24 : range === '7d' ? 7 : range === '30d' ? 30 : 90;

      for (let i = points; i >= 0; i--) {
        const timestamp = new Date(now);
        if (range === '24h') {
          timestamp.setHours(timestamp.getHours() - i);
        } else {
          timestamp.setDate(timestamp.getDate() - i);
        }

        mockData.push({
          time: range === '24h'
            ? timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          critical: Math.floor(Math.random() * 15) + 5,
          high: Math.floor(Math.random() * 30) + 15,
          medium: Math.floor(Math.random() * 50) + 25,
          low: Math.floor(Math.random() * 40) + 20
        });
      }
      return mockData;
    }

    return data.map(d => ({
      time: d.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      critical: d.critical,
      high: d.high,
      medium: d.medium,
      low: d.low
    }));
  }, [data, range]);

  const getRangeLabel = () => {
    switch (range) {
      case '24h': return '24 Hours';
      case '7d': return '7 Days';
      case '30d': return '30 Days';
      case '90d': return '90 Days';
      default: return '24 Hours';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: CHARTS.tooltipBg,
          border: `1px solid ${CHARTS.tooltipBorder}`,
          padding: '12px',
          borderRadius: '6px'
        }}>
          <p style={{ color: CHARTS.tooltipText, fontWeight: 'bold', marginBottom: '8px' }}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, fontSize: '12px', marginBottom: '2px' }}>
              {entry.name}: <span style={{ fontWeight: 'bold' }}>{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`shadow-lg h-96 p-0 overflow-hidden flex flex-col ${className}`}>
      <CardHeader
        title="Threat Timeline Analysis"
        subtitle={`Temporal Distribution - ${getRangeLabel()}`}
      />
      <div className="flex-1 w-full min-h-0">
        <div className="w-full h-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHARTS.grid} />
              <XAxis
                dataKey="time"
                stroke={CHARTS.text}
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke={CHARTS.text} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: CHARTS.text, fontSize: '12px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="critical"
                stroke={GRAPH.threatCritical}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Critical"
              />
              <Line
                type="monotone"
                dataKey="high"
                stroke={GRAPH.threatHigh}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="High"
              />
              <Line
                type="monotone"
                dataKey="medium"
                stroke={GRAPH.threatMedium}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Medium"
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke={CHARTS.primary}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Low"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default TimelineChart;
