
import React, { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface ComplianceMetric {
  category: string;
  score: number;
  maxScore: number;
  framework: string;
}

interface ComplianceRadarProps {
  data?: ComplianceMetric[];
  framework?: 'NIST' | 'ISO27001' | 'SOC2' | 'GDPR' | 'ALL';
  className?: string;
}

const ComplianceRadar: React.FC<ComplianceRadarProps> = ({
  data,
  framework = 'ALL',
  className = ''
}) => {
  const CHARTS = TOKENS.dark.charts;
  const GRAPH = TOKENS.dark.graph;

  const radarData = useMemo(() => {
    if (!data || data.length === 0) {
      // Mock compliance data
      return [
        { category: 'Access Control', current: 85, target: 95, fullMark: 100 },
        { category: 'Data Protection', current: 78, target: 90, fullMark: 100 },
        { category: 'Incident Response', current: 92, target: 95, fullMark: 100 },
        { category: 'Risk Management', current: 71, target: 85, fullMark: 100 },
        { category: 'Security Monitoring', current: 88, target: 95, fullMark: 100 },
        { category: 'Vulnerability Mgmt', current: 82, target: 90, fullMark: 100 },
        { category: 'Asset Management', current: 75, target: 85, fullMark: 100 },
        { category: 'Security Training', current: 68, target: 80, fullMark: 100 }
      ];
    }

    return data.map(d => ({
      category: d.category,
      current: (d.score / d.maxScore) * 100,
      target: 90, // Default target
      fullMark: 100
    }));
  }, [data]);

  const averageScore = useMemo(() => {
    const total = radarData.reduce((sum, item) => sum + item.current, 0);
    return Math.round(total / radarData.length);
  }, [radarData]);

  const getComplianceLevel = (score: number) => {
    if (score >= 90) return { level: 'EXCELLENT', color: CHARTS.primary };
    if (score >= 75) return { level: 'GOOD', color: '#10b981' };
    if (score >= 60) return { level: 'FAIR', color: GRAPH.threatMedium };
    return { level: 'NEEDS IMPROVEMENT', color: GRAPH.threatHigh };
  };

  const compliance = getComplianceLevel(averageScore);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: CHARTS.tooltipBg,
          border: `1px solid ${CHARTS.tooltipBorder}`,
          padding: '12px',
          borderRadius: '6px'
        }}>
          <p style={{ color: CHARTS.tooltipText, fontWeight: 'bold', marginBottom: '6px' }}>
            {payload[0].payload.category}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.stroke, fontSize: '12px', marginBottom: '2px' }}>
              {entry.name}: <span style={{ fontWeight: 'bold' }}>{Math.round(entry.value)}%</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`shadow-lg h-[500px] p-0 overflow-hidden flex flex-col ${className}`}>
      <CardHeader
        title="Compliance Radar"
        subtitle={`${framework} Framework Assessment`}
      />
      <div className="flex-1 w-full min-h-0">
        <div className="w-full h-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke={CHARTS.grid} />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: CHARTS.text, fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: CHARTS.text, fontSize: 10 }}
              />
              <Radar
                name="Current Score"
                dataKey="current"
                stroke={CHARTS.primary}
                fill={CHARTS.primary}
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Radar
                name="Target Score"
                dataKey="target"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: CHARTS.text, fontSize: '12px' }}
                iconType="circle"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="px-4 pb-4 border-t border-[var(--colors-borderDefault)] pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-[var(--colors-textSecondary)] mb-1">
              Overall Compliance Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[var(--colors-textPrimary)]">
                {averageScore}%
              </span>
              <span
                className="text-xs font-bold uppercase px-2 py-1 rounded"
                style={{
                  backgroundColor: `${compliance.color}20`,
                  color: compliance.color
                }}
              >
                {compliance.level}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--colors-textSecondary)] mb-1">
              Areas Meeting Target
            </p>
            <div className="text-2xl font-bold text-[var(--colors-textPrimary)]">
              {radarData.filter(d => d.current >= d.target).length} / {radarData.length}
            </div>
          </div>
        </div>

        {/* Areas Needing Attention */}
        <div className="mt-4">
          <p className="text-xs text-[var(--colors-textSecondary)] mb-2">
            Areas Requiring Attention:
          </p>
          <div className="flex flex-wrap gap-2">
            {radarData
              .filter(d => d.current < d.target)
              .sort((a, b) => a.current - b.current)
              .slice(0, 3)
              .map((item, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: '#ef444420',
                    color: GRAPH.threatHigh
                  }}
                >
                  {item.category} ({Math.round(item.current)}%)
                </span>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ComplianceRadar;
