
import React, { useMemo } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface TrendDataPoint {
  timestamp: Date;
  actual: number;
  predicted: number;
  upperBound?: number;
  lowerBound?: number;
}

interface TrendAnalysisProps {
  data?: TrendDataPoint[];
  metric?: string;
  range?: '7d' | '30d' | '90d';
  className?: string;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  data,
  metric = 'Threats',
  range = '30d',
  className = ''
}) => {
  const CHARTS = TOKENS.dark.charts;

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate mock trend prediction data
      const mockData = [];
      const now = new Date();
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const futureDays = Math.floor(days / 3); // Predict 1/3 of the range into the future

      for (let i = days; i >= -futureDays; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const baseValue = 50;
        const trend = -i * 0.5; // Upward trend
        const seasonality = Math.sin((i / 7) * Math.PI) * 10; // Weekly pattern
        const noise = i >= 0 ? Math.random() * 10 - 5 : 0; // Only add noise to historical data

        const actualValue = i >= 0 ? baseValue + trend + seasonality + noise : null;
        const predictedValue = i <= 0 ? baseValue + trend + seasonality : null;
        const confidence = i <= 0 ? 15 : null; // Confidence interval

        mockData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          actual: actualValue ? Math.max(0, Math.round(actualValue)) : null,
          predicted: predictedValue ? Math.max(0, Math.round(predictedValue)) : null,
          upperBound: predictedValue && confidence ? Math.round(predictedValue + confidence) : null,
          lowerBound: predictedValue && confidence ? Math.max(0, Math.round(predictedValue - confidence)) : null,
          isFuture: i < 0
        });
      }
      return mockData;
    }

    return data.map(d => ({
      date: d.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: d.actual,
      predicted: d.predicted,
      upperBound: d.upperBound,
      lowerBound: d.lowerBound
    }));
  }, [data, range]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: CHARTS.tooltipBg,
          border: `1px solid ${CHARTS.tooltipBorder}`,
          padding: '12px',
          borderRadius: '6px'
        }}>
          <p style={{ color: CHARTS.tooltipText, fontWeight: 'bold', marginBottom: '6px' }}>
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
        title="Trend Analysis & Forecasting"
        subtitle={`${metric} - ${range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}`}
      />
      <div className="flex-1 w-full min-h-0">
        <div className="w-full h-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHARTS.primary} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={CHARTS.primary} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHARTS.grid} />
              <XAxis
                dataKey="date"
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
                iconType="line"
              />

              {/* Confidence Interval Area */}
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill="url(#confidenceGradient)"
                fillOpacity={1}
                name="Confidence Interval"
              />

              {/* Actual Values Line */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke={CHARTS.primary}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Actual"
                connectNulls={false}
              />

              {/* Predicted Values Line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Predicted"
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prediction Summary */}
      <div className="px-4 pb-3 border-t border-[var(--colors-borderDefault)] pt-3">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5" style={{ backgroundColor: CHARTS.primary }} />
            <span style={{ color: CHARTS.text }}>Historical Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#10b981' }} />
            <span style={{ color: CHARTS.text }}>Forecast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded" style={{ backgroundColor: CHARTS.primary, opacity: 0.2 }} />
            <span style={{ color: CHARTS.text }}>Confidence</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TrendAnalysis;
