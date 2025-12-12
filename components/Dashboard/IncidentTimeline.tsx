
import React, { useMemo } from 'react';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface IncidentEvent {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'detection' | 'escalation' | 'containment' | 'resolution' | 'analysis';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
}

interface IncidentTimelineProps {
  events?: IncidentEvent[];
  incidentId?: string;
  className?: string;
}

const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  events,
  incidentId,
  className = ''
}) => {
  const GRAPH = TOKENS.dark.graph;
  const CHARTS = TOKENS.dark.charts;

  const timelineEvents = useMemo(() => {
    if (!events || events.length === 0) {
      // Mock incident timeline data
      const now = new Date();
      return [
        {
          id: '1',
          timestamp: new Date(now.getTime() - 3600000 * 4),
          title: 'Suspicious Activity Detected',
          description: 'Unusual login attempts from IP 192.168.1.100',
          severity: 'MEDIUM' as const,
          type: 'detection' as const,
          status: 'resolved' as const
        },
        {
          id: '2',
          timestamp: new Date(now.getTime() - 3600000 * 3.5),
          title: 'Alert Escalated to SOC',
          description: 'Multiple failed authentication attempts triggered escalation',
          severity: 'HIGH' as const,
          type: 'escalation' as const,
          status: 'resolved' as const
        },
        {
          id: '3',
          timestamp: new Date(now.getTime() - 3600000 * 3),
          title: 'Analyst Investigation Started',
          description: 'Security analyst assigned to investigate the incident',
          severity: 'HIGH' as const,
          type: 'analysis' as const,
          status: 'resolved' as const
        },
        {
          id: '4',
          timestamp: new Date(now.getTime() - 3600000 * 2.5),
          title: 'Malicious Activity Confirmed',
          description: 'Brute force attack identified targeting admin accounts',
          severity: 'CRITICAL' as const,
          type: 'analysis' as const,
          status: 'contained' as const
        },
        {
          id: '5',
          timestamp: new Date(now.getTime() - 3600000 * 2),
          title: 'Containment Actions Initiated',
          description: 'Source IP blocked, affected accounts locked',
          severity: 'CRITICAL' as const,
          type: 'containment' as const,
          status: 'contained' as const
        },
        {
          id: '6',
          timestamp: new Date(now.getTime() - 3600000 * 1.5),
          title: 'Threat Neutralized',
          description: 'All attack vectors blocked, no data exfiltration detected',
          severity: 'MEDIUM' as const,
          type: 'containment' as const,
          status: 'resolved' as const
        },
        {
          id: '7',
          timestamp: new Date(now.getTime() - 3600000 * 1),
          title: 'Post-Incident Analysis',
          description: 'Reviewing logs and strengthening authentication policies',
          severity: 'LOW' as const,
          type: 'analysis' as const,
          status: 'investigating' as const
        },
        {
          id: '8',
          timestamp: new Date(now.getTime() - 3600000 * 0.5),
          title: 'Incident Resolution',
          description: 'Case closed, recommendations documented',
          severity: 'LOW' as const,
          type: 'resolution' as const,
          status: 'open' as const
        }
      ];
    }
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [events]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return GRAPH.threatCritical;
      case 'HIGH': return GRAPH.threatHigh;
      case 'MEDIUM': return GRAPH.threatMedium;
      default: return CHARTS.primary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'detection': return '🔍';
      case 'escalation': return '⬆️';
      case 'containment': return '🛡️';
      case 'resolution': return '✅';
      case 'analysis': return '🔬';
      default: return '📌';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      open: GRAPH.threatHigh,
      investigating: GRAPH.threatMedium,
      contained: CHARTS.primary,
      resolved: '#10b981'
    };

    return (
      <span
        className="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: `${statusColors[status]}20`,
          color: statusColors[status]
        }}
      >
        {status}
      </span>
    );
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <Card className={`shadow-lg h-[600px] p-0 overflow-hidden flex flex-col ${className}`}>
      <CardHeader
        title="Incident Timeline"
        subtitle={incidentId ? `Incident #${incidentId}` : 'Recent Security Events'}
      />
      <div className="flex-1 w-full min-h-0 overflow-y-auto">
        <div className="p-4">
          <div className="relative">
            {/* Timeline Line */}
            <div
              className="absolute left-6 top-0 bottom-0 w-0.5"
              style={{ backgroundColor: CHARTS.grid }}
            />

            {/* Timeline Events */}
            <div className="space-y-6">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="relative flex gap-4 group">
                  {/* Timeline Dot */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-4 border-[var(--colors-surfaceDefault)] z-10 relative"
                      style={{
                        backgroundColor: getSeverityColor(event.severity)
                      }}
                    >
                      {getTypeIcon(event.type)}
                    </div>
                  </div>

                  {/* Event Card */}
                  <div
                    className="flex-1 p-4 rounded-lg border border-[var(--colors-borderDefault)] group-hover:border-[var(--colors-borderHighlight)] transition-colors"
                    style={{
                      backgroundColor: 'var(--colors-surfaceDefault)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[var(--colors-textPrimary)] mb-1">
                          {event.title}
                        </h4>
                        <p className="text-xs text-[var(--colors-textSecondary)]">
                          {event.description}
                        </p>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs">
                      <span style={{ color: CHARTS.text }}>
                        ⏱️ {formatTimestamp(event.timestamp)}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${getSeverityColor(event.severity)}20`,
                          color: getSeverityColor(event.severity)
                        }}
                      >
                        {event.severity}
                      </span>
                      <span style={{ color: CHARTS.text }}>
                        {event.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="px-4 pb-3 border-t border-[var(--colors-borderDefault)] pt-3">
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: CHARTS.text }}>
            Total Events: <span className="font-bold">{timelineEvents.length}</span>
          </span>
          <span style={{ color: CHARTS.text }}>
            Duration: <span className="font-bold">
              {Math.round((timelineEvents[0].timestamp.getTime() - timelineEvents[timelineEvents.length - 1].timestamp.getTime()) / 3600000)}h
            </span>
          </span>
          <span style={{ color: CHARTS.text }}>
            Status: {timelineEvents[0] && getStatusBadge(timelineEvents[0].status)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default IncidentTimeline;
