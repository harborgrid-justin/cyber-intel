
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface RiskGaugeProps {
  score?: number; // 0-100
  label?: string;
  thresholds?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  className?: string;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  label = 'Overall Risk Score',
  thresholds = { low: 25, medium: 50, high: 75, critical: 90 },
  className = ''
}) => {
  const GRAPH = TOKENS.dark.graph;
  const CHARTS = TOKENS.dark.charts;

  const riskScore = score ?? 67; // Default to 67 for demo

  const { riskLevel, color, description } = useMemo(() => {
    if (riskScore >= thresholds.critical) {
      return {
        riskLevel: 'CRITICAL',
        color: GRAPH.threatCritical,
        description: 'Immediate action required'
      };
    } else if (riskScore >= thresholds.high) {
      return {
        riskLevel: 'HIGH',
        color: GRAPH.threatHigh,
        description: 'Significant risk detected'
      };
    } else if (riskScore >= thresholds.medium) {
      return {
        riskLevel: 'MEDIUM',
        color: GRAPH.threatMedium,
        description: 'Moderate risk level'
      };
    } else {
      return {
        riskLevel: 'LOW',
        color: CHARTS.primary,
        description: 'Acceptable risk level'
      };
    }
  }, [riskScore, thresholds, GRAPH, CHARTS]);

  // Create gauge data
  const gaugeData = [
    { name: 'Score', value: riskScore },
    { name: 'Remaining', value: 100 - riskScore }
  ];

  const COLORS = [color, '#1e293b']; // Score color and background

  return (
    <Card className={`shadow-lg h-80 p-0 overflow-hidden flex flex-col ${className}`}>
      <CardHeader title={label} />
      <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={0}
              dataKey="value"
            >
              {gaugeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centered Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '35%' }}>
          <div className="text-5xl font-bold font-mono" style={{ color }}>
            {riskScore}
          </div>
          <div className="text-sm text-[var(--colors-textSecondary)] mt-1">
            / 100
          </div>
          <div
            className="text-xs font-bold uppercase tracking-wider mt-3 px-3 py-1 rounded-full"
            style={{
              backgroundColor: `${color}20`,
              color: color
            }}
          >
            {riskLevel}
          </div>
          <div className="text-xs text-[var(--colors-textSecondary)] mt-2">
            {description}
          </div>
        </div>
      </div>

      {/* Risk Level Indicators */}
      <div className="px-4 pb-3 border-t border-[var(--colors-borderDefault)] pt-3">
        <div className="flex justify-between items-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: CHARTS.primary }} />
            <span style={{ color: CHARTS.text }}>LOW</span>
            <span style={{ color: CHARTS.text }}>0-{thresholds.medium}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: GRAPH.threatMedium }} />
            <span style={{ color: CHARTS.text }}>MED</span>
            <span style={{ color: CHARTS.text }}>{thresholds.medium}-{thresholds.high}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: GRAPH.threatHigh }} />
            <span style={{ color: CHARTS.text }}>HIGH</span>
            <span style={{ color: CHARTS.text }}>{thresholds.high}-{thresholds.critical}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: GRAPH.threatCritical }} />
            <span style={{ color: CHARTS.text }}>CRIT</span>
            <span style={{ color: CHARTS.text }}>{thresholds.critical}+</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RiskGauge;
