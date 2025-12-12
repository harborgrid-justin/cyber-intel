
import React, { useState } from 'react';
import { Badge } from '../Shared/UI';

interface ResponseMetric {
  label: string;
  value: number | string;
  target?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'good' | 'warning' | 'critical';
}

interface IncidentStats {
  total: number;
  active: number;
  resolved: number;
  avgResponseTime: string;
  avgResolutionTime: string;
  mttr: string; // Mean Time To Resolve
  mttd: string; // Mean Time To Detect
}

interface ResponseMetricsProps {
  timeRange?: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: string) => void;
}

const ResponseMetrics: React.FC<ResponseMetricsProps> = ({
  timeRange = '24h',
  onTimeRangeChange
}) => {
  const [selectedRange, setSelectedRange] = useState(timeRange);

  // Mock data - in production, this would come from API
  const stats: IncidentStats = {
    total: 127,
    active: 8,
    resolved: 119,
    avgResponseTime: '12m',
    avgResolutionTime: '4.2h',
    mttr: '3.8h',
    mttd: '8m'
  };

  const metrics: ResponseMetric[] = [
    { label: 'Response Time (SLA)', value: 12, target: 15, unit: 'min', trend: 'down', status: 'good' },
    { label: 'Resolution Time', value: 4.2, target: 6, unit: 'hrs', trend: 'down', status: 'good' },
    { label: 'SLA Compliance', value: 98.5, target: 95, unit: '%', trend: 'up', status: 'good' },
    { label: 'False Positives', value: 3.2, target: 5, unit: '%', trend: 'down', status: 'good' },
    { label: 'Escalation Rate', value: 12, target: 15, unit: '%', trend: 'stable', status: 'warning' },
    { label: 'Automation Rate', value: 67, target: 70, unit: '%', trend: 'up', status: 'warning' }
  ];

  const playbookStats = [
    { name: 'Malware Response', executed: 45, success: 97.8, avgTime: '8m' },
    { name: 'Phishing Investigation', executed: 38, success: 95.2, avgTime: '15m' },
    { name: 'Data Exfiltration', executed: 12, success: 100, avgTime: '22m' },
    { name: 'Ransomware Response', executed: 3, success: 100, avgTime: '35m' }
  ];

  const recentIncidents = [
    { id: 'INC-2025-0312', type: 'Malware', severity: 'HIGH', status: 'RESOLVED', responseTime: '8m', resolutionTime: '2.5h' },
    { id: 'INC-2025-0311', type: 'Phishing', severity: 'MEDIUM', status: 'RESOLVED', responseTime: '15m', resolutionTime: '1.2h' },
    { id: 'INC-2025-0310', type: 'Unauthorized Access', severity: 'CRITICAL', status: 'ACTIVE', responseTime: '5m', resolutionTime: '-' },
    { id: 'INC-2025-0309', type: 'Data Leak', severity: 'HIGH', status: 'ACTIVE', responseTime: '12m', resolutionTime: '-' }
  ];

  const getTrendIcon = (trend: ResponseMetric['trend']) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  const getStatusColor = (status: ResponseMetric['status']) => {
    const colors = {
      good: 'text-green-400',
      warning: 'text-yellow-400',
      critical: 'text-red-400'
    };
    return colors[status || 'warning'];
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      LOW: 'blue',
      MEDIUM: 'yellow',
      HIGH: 'orange',
      CRITICAL: 'red'
    };
    return colors[severity] || 'slate';
  };

  const handleTimeRangeChange = (range: string) => {
    setSelectedRange(range);
    onTimeRangeChange?.(range);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Response Metrics & Analytics</h3>
          <p className="text-xs text-slate-500">Monitor incident response performance</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-1 bg-slate-800 rounded-md p-1">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                selectedRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-xs text-slate-500 mt-1">Total Incidents</div>
          <div className="text-[10px] text-slate-600 mt-1">Last {selectedRange}</div>
        </div>

        <div className="bg-slate-900/50 border border-yellow-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{stats.active}</div>
          <div className="text-xs text-slate-500 mt-1">Active Incidents</div>
          <div className="text-[10px] text-yellow-600 mt-1">Requiring Attention</div>
        </div>

        <div className="bg-slate-900/50 border border-green-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{stats.resolved}</div>
          <div className="text-xs text-slate-500 mt-1">Resolved</div>
          <div className="text-[10px] text-green-600 mt-1">{((stats.resolved / stats.total) * 100).toFixed(1)}% Success</div>
        </div>

        <div className="bg-slate-900/50 border border-purple-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{stats.mttr}</div>
          <div className="text-xs text-slate-500 mt-1">MTTR</div>
          <div className="text-[10px] text-purple-600 mt-1">Mean Time To Resolve</div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Key Performance Indicators</h4>
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-xs text-slate-400">{metric.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}
                    </span>
                    {metric.unit && <span className="text-xs text-slate-500">{metric.unit}</span>}
                  </div>
                </div>
                <span className="text-lg">{getTrendIcon(metric.trend)}</span>
              </div>

              {metric.target && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Target: {metric.target}{metric.unit}</span>
                    <span className={getStatusColor(metric.status)}>
                      {Number(metric.value) >= metric.target ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        metric.status === 'good' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((Number(metric.value) / metric.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Playbook Performance */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Playbook Performance</h4>
        <div className="space-y-2">
          {playbookStats.map((playbook, index) => (
            <div key={index} className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-200 font-medium">{playbook.name}</span>
                <div className="flex items-center gap-3">
                  <Badge className="text-[10px]">{playbook.executed} runs</Badge>
                  <span className={`text-sm font-bold ${
                    playbook.success >= 98 ? 'text-green-400' :
                    playbook.success >= 95 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {playbook.success}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Avg Execution Time: {playbook.avgTime}</span>
                <div className="flex-1 mx-3 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${playbook.success}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Incidents</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 font-medium py-2">ID</th>
                <th className="text-left text-slate-400 font-medium py-2">Type</th>
                <th className="text-left text-slate-400 font-medium py-2">Severity</th>
                <th className="text-left text-slate-400 font-medium py-2">Status</th>
                <th className="text-left text-slate-400 font-medium py-2">Response Time</th>
                <th className="text-left text-slate-400 font-medium py-2">Resolution Time</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.map((incident) => (
                <tr key={incident.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="py-2 text-slate-300 font-mono">{incident.id}</td>
                  <td className="py-2 text-slate-300">{incident.type}</td>
                  <td className="py-2">
                    <Badge color={getSeverityColor(incident.severity)} className="text-[10px]">
                      {incident.severity}
                    </Badge>
                  </td>
                  <td className="py-2">
                    <Badge
                      color={incident.status === 'RESOLVED' ? 'green' : 'yellow'}
                      className="text-[10px]"
                    >
                      {incident.status}
                    </Badge>
                  </td>
                  <td className="py-2 text-slate-300">{incident.responseTime}</td>
                  <td className="py-2 text-slate-300">{incident.resolutionTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResponseMetrics;
