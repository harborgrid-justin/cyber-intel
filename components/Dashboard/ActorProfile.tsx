
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface ThreatActorData {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  sophistication: 'LOW' | 'MEDIUM' | 'HIGH' | 'ADVANCED';
  motivation: string[];
  targets: string[];
  ttps: { tactic: string; count: number }[];
  recentActivity: number;
  firstSeen: Date;
  lastSeen: Date;
}

interface ActorProfileProps {
  actor?: ThreatActorData;
  actorId?: string;
  className?: string;
}

const ActorProfile: React.FC<ActorProfileProps> = ({ actor, actorId, className = '' }) => {
  const GRAPH = TOKENS.dark.graph;
  const CHARTS = TOKENS.dark.charts;

  const actorData = useMemo(() => {
    if (!actor) {
      // Mock threat actor profile
      return {
        id: actorId || 'APT29',
        name: 'APT29 (Cozy Bear)',
        aliases: ['The Dukes', 'CozyDuke', 'Cozy Bear'],
        origin: 'Russia',
        sophistication: 'ADVANCED' as const,
        motivation: ['Espionage', 'Intelligence Gathering', 'Political'],
        targets: ['Government', 'Think Tanks', 'Defense Contractors', 'NGOs'],
        ttps: [
          { tactic: 'Spear Phishing', count: 45 },
          { tactic: 'Supply Chain Compromise', count: 28 },
          { tactic: 'Credential Dumping', count: 34 },
          { tactic: 'Lateral Movement', count: 31 },
          { tactic: 'Data Exfiltration', count: 42 }
        ],
        recentActivity: 87, // Activity score 0-100
        firstSeen: new Date('2014-01-15'),
        lastSeen: new Date('2024-12-10')
      };
    }
    return actor;
  }, [actor, actorId]);

  const getSophisticationColor = (level: string) => {
    switch (level) {
      case 'ADVANCED': return GRAPH.threatCritical;
      case 'HIGH': return GRAPH.threatHigh;
      case 'MEDIUM': return GRAPH.threatMedium;
      default: return CHARTS.primary;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: CHARTS.tooltipBg,
          border: `1px solid ${CHARTS.tooltipBorder}`,
          padding: '12px',
          borderRadius: '6px'
        }}>
          <p style={{ color: CHARTS.tooltipText, fontWeight: 'bold', marginBottom: '4px' }}>
            {payload[0].payload.tactic}
          </p>
          <p style={{ color: CHARTS.primary, fontSize: '12px' }}>
            Observed: <span style={{ fontWeight: 'bold' }}>{payload[0].value} times</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`shadow-lg p-0 overflow-hidden flex flex-col ${className}`}>
      <CardHeader
        title="Threat Actor Profile"
        subtitle={actorData.name}
      />
      <div className="flex-1 w-full min-h-0 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Actor Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[var(--colors-textSecondary)] mb-1">Actor ID</p>
              <p className="text-sm font-bold font-mono text-[var(--colors-textPrimary)]">
                {actorData.id}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--colors-textSecondary)] mb-1">Origin</p>
              <p className="text-sm font-bold text-[var(--colors-textPrimary)]">
                {actorData.origin}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--colors-textSecondary)] mb-1">Sophistication</p>
              <span
                className="inline-block text-xs font-bold uppercase px-2 py-1 rounded"
                style={{
                  backgroundColor: `${getSophisticationColor(actorData.sophistication)}20`,
                  color: getSophisticationColor(actorData.sophistication)
                }}
              >
                {actorData.sophistication}
              </span>
            </div>
            <div>
              <p className="text-xs text-[var(--colors-textSecondary)] mb-1">Recent Activity</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[var(--colors-surfaceRaised)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${actorData.recentActivity}%`,
                      backgroundColor: actorData.recentActivity > 70 ? GRAPH.threatHigh : GRAPH.threatMedium
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-[var(--colors-textPrimary)]">
                  {actorData.recentActivity}%
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t border-[var(--colors-borderDefault)] pt-4">
            <p className="text-xs text-[var(--colors-textSecondary)] mb-2">Timeline</p>
            <div className="flex justify-between text-xs">
              <div>
                <p style={{ color: CHARTS.text }}>First Seen</p>
                <p className="font-bold text-[var(--colors-textPrimary)]">
                  {actorData.firstSeen.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p style={{ color: CHARTS.text }}>Last Seen</p>
                <p className="font-bold text-[var(--colors-textPrimary)]">
                  {actorData.lastSeen.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Aliases */}
          <div className="border-t border-[var(--colors-borderDefault)] pt-4">
            <p className="text-xs text-[var(--colors-textSecondary)] mb-2">Known Aliases</p>
            <div className="flex flex-wrap gap-2">
              {actorData.aliases.map((alias, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded border border-[var(--colors-borderDefault)] text-[var(--colors-textPrimary)]"
                >
                  {alias}
                </span>
              ))}
            </div>
          </div>

          {/* Motivation */}
          <div className="border-t border-[var(--colors-borderDefault)] pt-4">
            <p className="text-xs text-[var(--colors-textSecondary)] mb-2">Motivation</p>
            <div className="flex flex-wrap gap-2">
              {actorData.motivation.map((motive, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${CHARTS.primary}20`,
                    color: CHARTS.primary
                  }}
                >
                  {motive}
                </span>
              ))}
            </div>
          </div>

          {/* Targets */}
          <div className="border-t border-[var(--colors-borderDefault)] pt-4">
            <p className="text-xs text-[var(--colors-textSecondary)] mb-2">Primary Targets</p>
            <div className="flex flex-wrap gap-2">
              {actorData.targets.map((target, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${GRAPH.threatMedium}20`,
                    color: GRAPH.threatMedium
                  }}
                >
                  {target}
                </span>
              ))}
            </div>
          </div>

          {/* TTPs Chart */}
          <div className="border-t border-[var(--colors-borderDefault)] pt-4">
            <p className="text-xs text-[var(--colors-textSecondary)] mb-3">
              Tactics, Techniques & Procedures (TTPs)
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actorData.ttps} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHARTS.grid} />
                  <XAxis type="number" stroke={CHARTS.text} fontSize={11} />
                  <YAxis dataKey="tactic" type="category" stroke={CHARTS.text} fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {actorData.ttps.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHARTS.primary} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-4 pb-3 border-t border-[var(--colors-borderDefault)] pt-3">
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: CHARTS.text }}>
            Active Since: <span className="font-bold">{new Date().getFullYear() - actorData.firstSeen.getFullYear()} years</span>
          </span>
          <span style={{ color: CHARTS.text }}>
            TTPs Observed: <span className="font-bold">{actorData.ttps.reduce((sum, t) => sum + t.count, 0)}</span>
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ActorProfile;
