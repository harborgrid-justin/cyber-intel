
import React, { useMemo, useState } from 'react';
import { Card, CardHeader } from '../../Shared/UI';
import { TOKENS } from '../../../styles/theme';

interface Alert {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  source: string;
  acknowledged: boolean;
}

interface AlertsWidgetProps {
  alerts?: Alert[];
  maxDisplay?: number;
  className?: string;
  onAlertClick?: (alert: Alert) => void;
  onAcknowledge?: (alertId: string) => void;
}

const AlertsWidget: React.FC<AlertsWidgetProps> = ({
  alerts,
  maxDisplay = 5,
  className = '',
  onAlertClick,
  onAcknowledge
}) => {
  const GRAPH = TOKENS.dark.graph;
  const CHARTS = TOKENS.dark.charts;
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const mockAlerts: Alert[] = useMemo(() => {
    const now = new Date();
    return [
      {
        id: '1',
        timestamp: new Date(now.getTime() - 300000),
        title: 'Ransomware Activity Detected',
        description: 'Suspicious file encryption detected on server SRV-DB-01',
        severity: 'CRITICAL',
        category: 'Malware',
        source: 'EDR',
        acknowledged: false
      },
      {
        id: '2',
        timestamp: new Date(now.getTime() - 600000),
        title: 'Multiple Failed Login Attempts',
        description: 'Brute force attack detected from IP 185.234.219.45',
        severity: 'HIGH',
        category: 'Authentication',
        source: 'SIEM',
        acknowledged: false
      },
      {
        id: '3',
        timestamp: new Date(now.getTime() - 900000),
        title: 'Unusual Data Transfer',
        description: 'Large data upload to external cloud storage detected',
        severity: 'HIGH',
        category: 'Data Exfiltration',
        source: 'DLP',
        acknowledged: false
      },
      {
        id: '4',
        timestamp: new Date(now.getTime() - 1200000),
        title: 'Privilege Escalation Attempt',
        description: 'User attempted to access admin-level resources',
        severity: 'MEDIUM',
        category: 'Access Control',
        source: 'IAM',
        acknowledged: true
      },
      {
        id: '5',
        timestamp: new Date(now.getTime() - 1800000),
        title: 'Suspicious Network Traffic',
        description: 'Connection to known C2 server detected and blocked',
        severity: 'CRITICAL',
        category: 'Network',
        source: 'Firewall',
        acknowledged: true
      },
      {
        id: '6',
        timestamp: new Date(now.getTime() - 2400000),
        title: 'Vulnerability Scan Alert',
        description: 'Critical vulnerabilities found in web application',
        severity: 'MEDIUM',
        category: 'Vulnerability',
        source: 'Scanner',
        acknowledged: true
      },
      {
        id: '7',
        timestamp: new Date(now.getTime() - 3000000),
        title: 'Policy Violation',
        description: 'User attempted to install unauthorized software',
        severity: 'LOW',
        category: 'Compliance',
        source: 'Endpoint',
        acknowledged: true
      }
    ];
  }, []);

  const displayAlerts = useMemo(() => {
    const alertList = alerts || mockAlerts;
    const filtered = filter === 'ALL'
      ? alertList
      : alertList.filter(a => a.severity === filter);
    return filtered.slice(0, maxDisplay);
  }, [alerts, mockAlerts, filter, maxDisplay]);

  const alertCounts = useMemo(() => {
    const alertList = alerts || mockAlerts;
    return {
      CRITICAL: alertList.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length,
      HIGH: alertList.filter(a => a.severity === 'HIGH' && !a.acknowledged).length,
      MEDIUM: alertList.filter(a => a.severity === 'MEDIUM' && !a.acknowledged).length,
      LOW: alertList.filter(a => a.severity === 'LOW' && !a.acknowledged).length,
      total: alertList.filter(a => !a.acknowledged).length
    };
  }, [alerts, mockAlerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return GRAPH.threatCritical;
      case 'HIGH': return GRAPH.threatHigh;
      case 'MEDIUM': return GRAPH.threatMedium;
      default: return CHARTS.primary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '⚡';
      default: return '📢';
    }
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
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleAcknowledge = (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation();
    onAcknowledge?.(alertId);
  };

  return (
    <Card className={`shadow-lg h-[600px] p-0 overflow-hidden flex flex-col ${className}`}>
      <CardHeader
        title="Security Alerts"
        subtitle={`${alertCounts.total} Unacknowledged`}
      />

      {/* Filter Bar */}
      <div className="px-4 py-3 border-b border-[var(--colors-borderDefault)] bg-[var(--colors-surfaceRaised)]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-[var(--colors-primary)] text-white'
                : 'bg-[var(--colors-surfaceDefault)] text-[var(--colors-textSecondary)] hover:bg-[var(--colors-surfaceHighlight)]'
            }`}
          >
            ALL ({alertCounts.total})
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === 'CRITICAL'
                ? `text-white`
                : 'bg-[var(--colors-surfaceDefault)] text-[var(--colors-textSecondary)] hover:bg-[var(--colors-surfaceHighlight)]'
            }`}
            style={{
              backgroundColor: filter === 'CRITICAL' ? GRAPH.threatCritical : undefined
            }}
          >
            CRITICAL ({alertCounts.CRITICAL})
          </button>
          <button
            onClick={() => setFilter('HIGH')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === 'HIGH'
                ? `text-white`
                : 'bg-[var(--colors-surfaceDefault)] text-[var(--colors-textSecondary)] hover:bg-[var(--colors-surfaceHighlight)]'
            }`}
            style={{
              backgroundColor: filter === 'HIGH' ? GRAPH.threatHigh : undefined
            }}
          >
            HIGH ({alertCounts.HIGH})
          </button>
          <button
            onClick={() => setFilter('MEDIUM')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === 'MEDIUM'
                ? `text-white`
                : 'bg-[var(--colors-surfaceDefault)] text-[var(--colors-textSecondary)] hover:bg-[var(--colors-surfaceHighlight)]'
            }`}
            style={{
              backgroundColor: filter === 'MEDIUM' ? GRAPH.threatMedium : undefined
            }}
          >
            MEDIUM ({alertCounts.MEDIUM})
          </button>
          <button
            onClick={() => setFilter('LOW')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === 'LOW'
                ? `text-white`
                : 'bg-[var(--colors-surfaceDefault)] text-[var(--colors-textSecondary)] hover:bg-[var(--colors-surfaceHighlight)]'
            }`}
            style={{
              backgroundColor: filter === 'LOW' ? CHARTS.primary : undefined
            }}
          >
            LOW ({alertCounts.LOW})
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto">
        {displayAlerts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm font-bold text-[var(--colors-textPrimary)]">
                No {filter !== 'ALL' ? filter.toLowerCase() : ''} alerts
              </p>
              <p className="text-xs text-[var(--colors-textSecondary)] mt-1">
                All systems operating normally
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--colors-borderDefault)]">
            {displayAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 hover:bg-[var(--colors-surfaceHighlight)] transition-colors cursor-pointer ${
                  alert.acknowledged ? 'opacity-50' : ''
                }`}
                onClick={() => onAlertClick?.(alert)}
              >
                <div className="flex items-start gap-3">
                  {/* Severity Icon */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: `${getSeverityColor(alert.severity)}20`,
                      color: getSeverityColor(alert.severity)
                    }}
                  >
                    {getSeverityIcon(alert.severity)}
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[var(--colors-textPrimary)] truncate">
                        {alert.title}
                      </h4>
                      <span className="text-xs text-[var(--colors-textSecondary)] whitespace-nowrap">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--colors-textSecondary)] mb-2 line-clamp-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-bold uppercase px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${getSeverityColor(alert.severity)}20`,
                          color: getSeverityColor(alert.severity)
                        }}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded border border-[var(--colors-borderDefault)] text-[var(--colors-textSecondary)]">
                        {alert.category}
                      </span>
                      <span className="text-xs text-[var(--colors-textSecondary)]">
                        {alert.source}
                      </span>
                      {!alert.acknowledged && onAcknowledge && (
                        <button
                          onClick={(e) => handleAcknowledge(e, alert.id)}
                          className="ml-auto text-xs px-3 py-1 rounded bg-[var(--colors-primary)] text-white hover:opacity-80 transition-opacity"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.acknowledged && (
                        <span className="ml-auto text-xs text-[var(--colors-success)]">
                          ✓ Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-3 border-t border-[var(--colors-borderDefault)] bg-[var(--colors-surfaceRaised)]">
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: CHARTS.text }}>
            Showing: <span className="font-bold">{displayAlerts.length}</span> alerts
          </span>
          <span style={{ color: CHARTS.text }}>
            Unacknowledged: <span className="font-bold">{alertCounts.total}</span>
          </span>
        </div>
      </div>
    </Card>
  );
};

export default AlertsWidget;
