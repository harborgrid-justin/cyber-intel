
import React, { useState, useMemo } from 'react';
import { Card, CardHeader } from '../Shared/UI';
import { TOKENS } from '../../styles/theme';

interface TacticTechnique {
  id: string;
  name: string;
  count: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface MitreTactic {
  id: string;
  name: string;
  techniques: TacticTechnique[];
}

interface ThreatMatrixProps {
  data?: MitreTactic[];
  className?: string;
}

const ThreatMatrix: React.FC<ThreatMatrixProps> = ({ data, className = '' }) => {
  const GRAPH = TOKENS.dark.graph;
  const CHARTS = TOKENS.dark.charts;
  const [selectedTechnique, setSelectedTechnique] = useState<TacticTechnique | null>(null);

  const matrixData = useMemo(() => {
    if (!data || data.length === 0) {
      // Mock MITRE ATT&CK data
      return [
        {
          id: 'TA0001',
          name: 'Initial Access',
          techniques: [
            { id: 'T1190', name: 'Exploit Public-Facing Application', count: 23, severity: 'CRITICAL' },
            { id: 'T1566', name: 'Phishing', count: 45, severity: 'HIGH' },
            { id: 'T1078', name: 'Valid Accounts', count: 18, severity: 'HIGH' }
          ]
        },
        {
          id: 'TA0002',
          name: 'Execution',
          techniques: [
            { id: 'T1059', name: 'Command and Scripting', count: 34, severity: 'HIGH' },
            { id: 'T1203', name: 'Exploitation for Client Execution', count: 12, severity: 'MEDIUM' },
            { id: 'T1204', name: 'User Execution', count: 28, severity: 'MEDIUM' }
          ]
        },
        {
          id: 'TA0003',
          name: 'Persistence',
          techniques: [
            { id: 'T1547', name: 'Boot or Logon Autostart', count: 15, severity: 'MEDIUM' },
            { id: 'T1053', name: 'Scheduled Task/Job', count: 22, severity: 'HIGH' },
            { id: 'T1136', name: 'Create Account', count: 8, severity: 'LOW' }
          ]
        },
        {
          id: 'TA0004',
          name: 'Privilege Escalation',
          techniques: [
            { id: 'T1068', name: 'Exploitation for Privilege Escalation', count: 19, severity: 'CRITICAL' },
            { id: 'T1548', name: 'Abuse Elevation Control', count: 11, severity: 'MEDIUM' },
            { id: 'T1134', name: 'Access Token Manipulation', count: 7, severity: 'MEDIUM' }
          ]
        },
        {
          id: 'TA0005',
          name: 'Defense Evasion',
          techniques: [
            { id: 'T1027', name: 'Obfuscated Files or Information', count: 41, severity: 'HIGH' },
            { id: 'T1070', name: 'Indicator Removal', count: 25, severity: 'HIGH' },
            { id: 'T1562', name: 'Impair Defenses', count: 16, severity: 'CRITICAL' }
          ]
        },
        {
          id: 'TA0006',
          name: 'Credential Access',
          techniques: [
            { id: 'T1110', name: 'Brute Force', count: 33, severity: 'HIGH' },
            { id: 'T1003', name: 'OS Credential Dumping', count: 27, severity: 'CRITICAL' },
            { id: 'T1555', name: 'Credentials from Password Stores', count: 14, severity: 'MEDIUM' }
          ]
        },
        {
          id: 'TA0007',
          name: 'Discovery',
          techniques: [
            { id: 'T1083', name: 'File and Directory Discovery', count: 31, severity: 'MEDIUM' },
            { id: 'T1018', name: 'Remote System Discovery', count: 19, severity: 'MEDIUM' },
            { id: 'T1082', name: 'System Information Discovery', count: 24, severity: 'LOW' }
          ]
        },
        {
          id: 'TA0008',
          name: 'Lateral Movement',
          techniques: [
            { id: 'T1021', name: 'Remote Services', count: 21, severity: 'HIGH' },
            { id: 'T1210', name: 'Exploitation of Remote Services', count: 13, severity: 'CRITICAL' },
            { id: 'T1080', name: 'Taint Shared Content', count: 6, severity: 'MEDIUM' }
          ]
        },
        {
          id: 'TA0009',
          name: 'Collection',
          techniques: [
            { id: 'T1560', name: 'Archive Collected Data', count: 17, severity: 'MEDIUM' },
            { id: 'T1005', name: 'Data from Local System', count: 29, severity: 'HIGH' },
            { id: 'T1113', name: 'Screen Capture', count: 9, severity: 'LOW' }
          ]
        },
        {
          id: 'TA0010',
          name: 'Exfiltration',
          techniques: [
            { id: 'T1041', name: 'Exfiltration Over C2 Channel', count: 26, severity: 'CRITICAL' },
            { id: 'T1567', name: 'Exfiltration Over Web Service', count: 18, severity: 'HIGH' },
            { id: 'T1020', name: 'Automated Exfiltration', count: 11, severity: 'MEDIUM' }
          ]
        },
        {
          id: 'TA0011',
          name: 'Impact',
          techniques: [
            { id: 'T1486', name: 'Data Encrypted for Impact', count: 38, severity: 'CRITICAL' },
            { id: 'T1490', name: 'Inhibit System Recovery', count: 15, severity: 'HIGH' },
            { id: 'T1498', name: 'Network Denial of Service', count: 12, severity: 'HIGH' }
          ]
        }
      ];
    }
    return data;
  }, [data]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return GRAPH.threatCritical;
      case 'HIGH': return GRAPH.threatHigh;
      case 'MEDIUM': return GRAPH.threatMedium;
      default: return CHARTS.primary;
    }
  };

  const getSeverityIntensity = (count: number) => {
    if (count >= 30) return 1;
    if (count >= 20) return 0.8;
    if (count >= 10) return 0.6;
    return 0.4;
  };

  return (
    <Card className={`shadow-lg p-0 overflow-hidden flex flex-col ${className}`}>
      <CardHeader
        title="MITRE ATT&CK Matrix"
        subtitle="Threat Technique Coverage"
      />
      <div className="flex-1 w-full min-h-0 overflow-auto">
        <div className="p-4">
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {matrixData.map((tactic) => (
              <div
                key={tactic.id}
                className="border border-[var(--colors-borderDefault)] rounded-lg overflow-hidden"
              >
                {/* Tactic Header */}
                <div
                  className="px-3 py-2 font-bold text-xs uppercase tracking-wider text-center"
                  style={{
                    backgroundColor: CHARTS.primary,
                    color: '#fff'
                  }}
                >
                  {tactic.name}
                </div>

                {/* Techniques */}
                <div className="p-2 space-y-2">
                  {tactic.techniques.map((technique) => (
                    <div
                      key={technique.id}
                      className="p-2 rounded cursor-pointer transition-all hover:scale-105"
                      style={{
                        backgroundColor: getSeverityColor(technique.severity),
                        opacity: getSeverityIntensity(technique.count),
                        border: selectedTechnique?.id === technique.id ? '2px solid #fff' : 'none'
                      }}
                      onMouseEnter={() => setSelectedTechnique(technique)}
                      onMouseLeave={() => setSelectedTechnique(null)}
                    >
                      <div className="text-[10px] font-mono text-white mb-1">
                        {technique.id}
                      </div>
                      <div className="text-xs font-medium text-white leading-tight">
                        {technique.name}
                      </div>
                      <div className="text-xs font-bold text-white mt-1">
                        {technique.count} detections
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Technique Details */}
      {selectedTechnique && (
        <div className="px-4 pb-3 border-t border-[var(--colors-borderDefault)] pt-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--colors-textPrimary)]">
                {selectedTechnique.id}: {selectedTechnique.name}
              </p>
              <p className="text-xs text-[var(--colors-textSecondary)] mt-1">
                Detections: <span className="font-bold">{selectedTechnique.count}</span>
                {' | '}
                Severity: <span style={{ color: getSeverityColor(selectedTechnique.severity) }} className="font-bold">
                  {selectedTechnique.severity}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 pb-3 flex gap-4 text-xs border-t border-[var(--colors-borderDefault)] pt-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: GRAPH.threatCritical }} />
          <span style={{ color: CHARTS.text }}>Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: GRAPH.threatHigh }} />
          <span style={{ color: CHARTS.text }}>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: GRAPH.threatMedium }} />
          <span style={{ color: CHARTS.text }}>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: CHARTS.primary }} />
          <span style={{ color: CHARTS.text }}>Low</span>
        </div>
      </div>
    </Card>
  );
};

export default ThreatMatrix;
