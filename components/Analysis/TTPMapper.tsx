import React, { useState } from 'react';
import { Card, Button, Badge, CardHeader } from '../Shared/UI';

interface TTPMapping {
  ttp_id: string;
  ttp_name: string;
  tactic: string;
  confidence: number;
  evidence: string[];
}

interface KillChainPhase {
  phase_number: number;
  name: string;
  active: boolean;
  ttps: string[];
}

const TTPMapper: React.FC = () => {
  const [observedBehaviors, setObservedBehaviors] = useState<string[]>([]);
  const [ttpMappings, setTTPMappings] = useState<TTPMapping[]>([]);
  const [killChain, setKillChain] = useState<KillChainPhase[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);

    setTimeout(() => {
      const mockMappings: TTPMapping[] = [
        {
          ttp_id: 'T1566',
          ttp_name: 'Phishing',
          tactic: 'Initial Access',
          confidence: 0.92,
          evidence: ['Email with malicious attachment detected']
        },
        {
          ttp_id: 'T1059',
          ttp_name: 'Command and Scripting Interpreter',
          tactic: 'Execution',
          confidence: 0.88,
          evidence: ['PowerShell execution with obfuscated commands']
        },
        {
          ttp_id: 'T1547',
          ttp_name: 'Boot or Logon Autostart Execution',
          tactic: 'Persistence',
          confidence: 0.85,
          evidence: ['Registry Run key modification detected']
        },
        {
          ttp_id: 'T1071',
          ttp_name: 'Application Layer Protocol',
          tactic: 'Command and Control',
          confidence: 0.90,
          evidence: ['HTTPS traffic to suspicious domain']
        }
      ];

      const mockKillChain: KillChainPhase[] = [
        { phase_number: 1, name: 'Reconnaissance', active: false, ttps: [] },
        { phase_number: 2, name: 'Weaponization', active: false, ttps: [] },
        { phase_number: 3, name: 'Delivery', active: true, ttps: ['T1566'] },
        { phase_number: 4, name: 'Exploitation', active: true, ttps: ['T1059'] },
        { phase_number: 5, name: 'Installation', active: true, ttps: ['T1547'] },
        { phase_number: 6, name: 'Command and Control', active: true, ttps: ['T1071'] },
        { phase_number: 7, name: 'Actions on Objectives', active: false, ttps: [] }
      ];

      setTTPMappings(mockMappings);
      setKillChain(mockKillChain);
      setAnalyzing(false);
    }, 2000);
  };

  const loadSample = () => {
    setObservedBehaviors([
      'Spear phishing email with malicious Excel attachment',
      'PowerShell.exe spawned with encoded command line',
      'Registry modification at HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
      'Outbound HTTPS connections to unknown domain',
      'Large data transfer over encrypted channel'
    ]);
  };

  const getTacticColor = (tactic: string) => {
    const colors: Record<string, string> = {
      'Initial Access': 'red',
      'Execution': 'orange',
      'Persistence': 'yellow',
      'Privilege Escalation': 'lime',
      'Defense Evasion': 'green',
      'Credential Access': 'cyan',
      'Discovery': 'blue',
      'Lateral Movement': 'purple',
      'Collection': 'pink',
      'Command and Control': 'rose',
      'Exfiltration': 'fuchsia',
      'Impact': 'red'
    };
    return colors[tactic] || 'gray';
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <Card className="border-orange-500/20 shadow-lg shadow-orange-900/10">
        <CardHeader
          title={<><span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>TTP Mapping & Analysis</>}
          action={
            <div className="flex gap-2">
              <Button onClick={loadSample} variant="text" className="text-xs text-slate-500">Load Sample</Button>
              <Button onClick={handleAnalyze} disabled={analyzing || observedBehaviors.length === 0} variant="primary">
                {analyzing ? 'Mapping TTPs...' : 'Map to MITRE ATT&CK'}
              </Button>
            </div>
          }
        />

        <div className="space-y-6">
          {/* Observed Behaviors */}
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Observed Behaviors ({observedBehaviors.length})</h3>
            <div className="space-y-2">
              {observedBehaviors.map((behavior, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs bg-slate-950/50 p-2 rounded">
                  <Badge variant="info" className="shrink-0">#{idx + 1}</Badge>
                  <span className="text-slate-300">{behavior}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Kill Chain Visualization */}
          {killChain.length > 0 && (
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Cyber Kill Chain Progress</h3>
              <div className="space-y-2">
                {killChain.map(phase => (
                  <div key={phase.phase_number} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      phase.active ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-600'
                    }`}>
                      {phase.active ? '✓' : phase.phase_number}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${phase.active ? 'text-slate-200 font-medium' : 'text-slate-600'}`}>
                        {phase.name}
                      </div>
                      {phase.active && phase.ttps.length > 0 && (
                        <div className="text-xs text-orange-400 mt-1">
                          TTPs: {phase.ttps.join(', ')}
                        </div>
                      )}
                    </div>
                    {phase.active && <Badge variant="success" className="text-xs">Active</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TTP Mappings */}
          {ttpMappings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">MITRE ATT&CK TTP Mappings</h3>
              {ttpMappings.map(mapping => (
                <div key={mapping.ttp_id} className="bg-slate-900/50 rounded-lg p-4 border border-orange-500/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="warning" className="font-mono text-xs">{mapping.ttp_id}</Badge>
                      <div>
                        <div className="text-sm font-semibold text-slate-200">{mapping.ttp_name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          <Badge variant={getTacticColor(mapping.tactic) as any} className="text-xs">
                            {mapping.tactic}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Confidence</div>
                      <div className="text-orange-400 font-bold">{Math.round(mapping.confidence * 100)}%</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-slate-500 mb-2">Evidence:</div>
                    <div className="space-y-1">
                      {mapping.evidence.map((evidence, idx) => (
                        <div key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-orange-500 shrink-0">•</span>
                          <span>{evidence}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {analyzing && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xs text-orange-500 font-mono animate-pulse">Mapping behaviors to MITRE ATT&CK framework...</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TTPMapper;
