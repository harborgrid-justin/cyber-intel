
import React, { useMemo } from 'react';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface CampaignStage {
  id: string;
  name: string;
  phase: 'reconnaissance' | 'weaponization' | 'delivery' | 'exploitation' | 'installation' | 'c2' | 'actions';
  status: 'completed' | 'active' | 'blocked' | 'pending';
  timestamp?: Date;
  details: string;
  indicators: number;
}

interface CampaignFlowProps {
  stages?: CampaignStage[];
  campaignName?: string;
  className?: string;
}

const CampaignFlow: React.FC<CampaignFlowProps> = ({
  stages,
  campaignName = 'Operation Ghost',
  className = ''
}) => {
  const GRAPH = TOKENS.dark.graph;
  const CHARTS = TOKENS.dark.charts;

  const flowStages = useMemo(() => {
    if (!stages || stages.length === 0) {
      // Mock cyber kill chain campaign data
      const now = new Date();
      return [
        {
          id: '1',
          name: 'Target Reconnaissance',
          phase: 'reconnaissance' as const,
          status: 'completed' as const,
          timestamp: new Date(now.getTime() - 3600000 * 48),
          details: 'Network scanning and OSINT gathering on target infrastructure',
          indicators: 12
        },
        {
          id: '2',
          name: 'Malware Development',
          phase: 'weaponization' as const,
          status: 'completed' as const,
          timestamp: new Date(now.getTime() - 3600000 * 36),
          details: 'Custom ransomware payload created with evasion techniques',
          indicators: 8
        },
        {
          id: '3',
          name: 'Phishing Campaign',
          phase: 'delivery' as const,
          status: 'completed' as const,
          timestamp: new Date(now.getTime() - 3600000 * 24),
          details: 'Spear-phishing emails sent to 47 executives',
          indicators: 23
        },
        {
          id: '4',
          name: 'Initial Compromise',
          phase: 'exploitation' as const,
          status: 'completed' as const,
          timestamp: new Date(now.getTime() - 3600000 * 18),
          details: '3 successful compromises via malicious attachments',
          indicators: 15
        },
        {
          id: '5',
          name: 'Persistence Established',
          phase: 'installation' as const,
          status: 'active' as const,
          timestamp: new Date(now.getTime() - 3600000 * 12),
          details: 'Registry modifications and scheduled tasks created',
          indicators: 19
        },
        {
          id: '6',
          name: 'Command & Control',
          phase: 'c2' as const,
          status: 'blocked' as const,
          timestamp: new Date(now.getTime() - 3600000 * 6),
          details: 'C2 communications to 185.234.x.x blocked by firewall',
          indicators: 31
        },
        {
          id: '7',
          name: 'Objective Execution',
          phase: 'actions' as const,
          status: 'blocked' as const,
          details: 'Ransomware deployment prevented by EDR',
          indicators: 7
        }
      ];
    }
    return stages;
  }, [stages]);

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      reconnaissance: '#64748b',
      weaponization: '#8b5cf6',
      delivery: GRAPH.threatMedium,
      exploitation: GRAPH.threatHigh,
      installation: GRAPH.threatHigh,
      c2: GRAPH.threatCritical,
      actions: GRAPH.threatCritical
    };
    return colors[phase] || CHARTS.primary;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#64748b';
      case 'active': return GRAPH.threatHigh;
      case 'blocked': return '#10b981';
      case 'pending': return CHARTS.text;
      default: return CHARTS.text;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'active': return '⚡';
      case 'blocked': return '🛡️';
      case 'pending': return '⏳';
      default: return '●';
    }
  };

  return (
    <Card className={`shadow-lg h-[600px] p-0 overflow-hidden flex flex-col ${className}`}>
      <CardHeader
        title="Campaign Flow Diagram"
        subtitle={`${campaignName} - Cyber Kill Chain`}
      />
      <div className="flex-1 w-full min-h-0 overflow-y-auto">
        <div className="p-6">
          <div className="relative">
            {/* Flow Line */}
            <div
              className="absolute left-8 top-0 bottom-0 w-1 rounded-full"
              style={{
                background: `linear-gradient(to bottom, ${CHARTS.primary}, ${GRAPH.threatCritical})`
              }}
            />

            {/* Flow Stages */}
            <div className="space-y-6">
              {flowStages.map((stage, index) => (
                <div key={stage.id} className="relative flex gap-6 group">
                  {/* Stage Number & Icon */}
                  <div className="relative flex-shrink-0 z-10">
                    <div
                      className="w-16 h-16 rounded-lg flex flex-col items-center justify-center border-4 border-[var(--colors-surfaceDefault)]"
                      style={{
                        backgroundColor: getPhaseColor(stage.phase)
                      }}
                    >
                      <span className="text-white text-xs font-bold">
                        STAGE {index + 1}
                      </span>
                      <span className="text-white text-xl">
                        {getStatusIcon(stage.status)}
                      </span>
                    </div>
                  </div>

                  {/* Stage Card */}
                  <div className="flex-1">
                    <div
                      className="p-4 rounded-lg border-2 border-[var(--colors-borderDefault)] group-hover:border-[var(--colors-borderHighlight)] transition-all"
                      style={{
                        backgroundColor: 'var(--colors-surfaceDefault)',
                        borderLeftColor: getPhaseColor(stage.phase),
                        borderLeftWidth: '4px'
                      }}
                    >
                      {/* Stage Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-[var(--colors-textPrimary)] mb-1">
                            {stage.name}
                          </h4>
                          <p className="text-xs uppercase tracking-wider" style={{ color: getPhaseColor(stage.phase) }}>
                            {stage.phase.replace('c2', 'Command & Control')}
                          </p>
                        </div>
                        <span
                          className="text-xs font-bold uppercase px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: `${getStatusColor(stage.status)}20`,
                            color: getStatusColor(stage.status)
                          }}
                        >
                          {stage.status}
                        </span>
                      </div>

                      {/* Stage Details */}
                      <p className="text-sm text-[var(--colors-textSecondary)] mb-3">
                        {stage.details}
                      </p>

                      {/* Stage Meta */}
                      <div className="flex items-center gap-4 text-xs">
                        {stage.timestamp && (
                          <span style={{ color: CHARTS.text }}>
                            🕐 {stage.timestamp.toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                        <span style={{ color: CHARTS.text }}>
                          📊 {stage.indicators} IOCs
                        </span>
                      </div>
                    </div>

                    {/* Connector Arrow */}
                    {index < flowStages.length - 1 && (
                      <div className="flex items-center justify-center py-2">
                        <div className="text-2xl" style={{ color: CHARTS.grid }}>
                          ↓
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Summary */}
      <div className="px-4 pb-4 border-t border-[var(--colors-borderDefault)] pt-4">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="text-center">
            <p style={{ color: CHARTS.text }} className="mb-1">Total Stages</p>
            <p className="text-lg font-bold text-[var(--colors-textPrimary)]">
              {flowStages.length}
            </p>
          </div>
          <div className="text-center">
            <p style={{ color: CHARTS.text }} className="mb-1">Completed</p>
            <p className="text-lg font-bold" style={{ color: '#64748b' }}>
              {flowStages.filter(s => s.status === 'completed').length}
            </p>
          </div>
          <div className="text-center">
            <p style={{ color: CHARTS.text }} className="mb-1">Blocked</p>
            <p className="text-lg font-bold" style={{ color: '#10b981' }}>
              {flowStages.filter(s => s.status === 'blocked').length}
            </p>
          </div>
          <div className="text-center">
            <p style={{ color: CHARTS.text }} className="mb-1">Total IOCs</p>
            <p className="text-lg font-bold text-[var(--colors-textPrimary)]">
              {flowStages.reduce((sum, s) => sum + s.indicators, 0)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CampaignFlow;
