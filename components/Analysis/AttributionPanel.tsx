import React, { useState } from 'react';
import { Card, Button, Badge, CardHeader } from '../Shared/UI';

interface AttributionResult {
  actor: {
    id: string;
    name: string;
    aliases: string[];
    sophistication: string;
    origin: string;
  };
  score: number;
  confidence: number;
  matches: Array<{
    type: string;
    value: string;
    weight: number;
  }>;
  evidenceChain: Array<{
    type: string;
    description: string;
    confidence: number;
  }>;
}

const AttributionPanel: React.FC = () => {
  const [attributions, setAttributions] = useState<AttributionResult[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAttribution, setSelectedAttribution] = useState<AttributionResult | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);

    setTimeout(() => {
      const mockAttributions: AttributionResult[] = [
        {
          actor: {
            id: 'APT-001',
            name: 'Fancy Bear',
            aliases: ['APT28', 'Sofacy', 'Sednit'],
            sophistication: 'Advanced',
            origin: 'RU'
          },
          score: 87,
          confidence: 0.89,
          matches: [
            { type: 'TTP', value: 'Spear Phishing', weight: 30 },
            { type: 'INFRA', value: 'known-c2-server.com', weight: 25 },
            { type: 'TARGET', value: 'Government', weight: 15 }
          ],
          evidenceChain: [
            { type: 'TTP Match', description: 'Spear phishing technique matches actor profile', confidence: 0.85 },
            { type: 'Infrastructure', description: 'C2 server linked to previous campaigns', confidence: 0.92 },
            { type: 'Geographic', description: 'Activity originates from suspected region', confidence: 0.75 }
          ]
        },
        {
          actor: {
            id: 'APT-002',
            name: 'Lazarus Group',
            aliases: ['Hidden Cobra', 'APT38'],
            sophistication: 'Expert',
            origin: 'KP'
          },
          score: 72,
          confidence: 0.76,
          matches: [
            { type: 'EXPLOIT', value: 'WastedLocker Ransomware', weight: 18 },
            { type: 'TARGET', value: 'Financial', weight: 15 }
          ],
          evidenceChain: [
            { type: 'Exploit', description: 'Uses known exploit: WastedLocker', confidence: 0.80 },
            { type: 'Target Match', description: 'Financial sector matches actor targets', confidence: 0.72 }
          ]
        }
      ];

      setAttributions(mockAttributions);
      setSelectedAttribution(mockAttributions[0]);
      setAnalyzing(false);
    }, 2000);
  };

  const getSophisticationColor = (sophistication: string) => {
    const colors: Record<string, string> = {
      'Novice': 'info',
      'Intermediate': 'warning',
      'Advanced': 'danger',
      'Expert': 'purple'
    };
    return colors[sophistication] || 'gray';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Attribution List */}
      <Card className="lg:w-1/3 p-0 border-red-500/20 shadow-lg shadow-red-900/10">
        <CardHeader
          title={<><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>Threat Attribution</>}
          action={
            <Button onClick={handleAnalyze} disabled={analyzing} variant="primary" className="text-xs">
              {analyzing ? 'Analyzing...' : 'Run Attribution'}
            </Button>
          }
        />
        <div className="p-4 space-y-3">
          {analyzing ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xs text-red-500 font-mono animate-pulse">Running attribution analysis...</div>
              </div>
            </div>
          ) : attributions.length > 0 ? (
            attributions.map((attribution, idx) => (
              <div
                key={attribution.actor.id}
                onClick={() => setSelectedAttribution(attribution)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedAttribution?.actor.id === attribution.actor.id
                    ? 'bg-red-500/10 border-red-500'
                    : 'bg-slate-900/50 border-slate-800 hover:border-red-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{attribution.actor.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{attribution.actor.aliases.join(', ')}</div>
                  </div>
                  <Badge variant={idx === 0 ? 'danger' : 'warning'} className="text-xs">
                    #{idx + 1}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div>
                    <span className="text-slate-500">Score:</span>
                    <div className="text-red-400 font-bold">{attribution.score}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Confidence:</span>
                    <div className="text-red-400 font-bold">{Math.round(attribution.confidence * 100)}%</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-600 text-sm py-8">
              Click "Run Attribution" to begin analysis
            </div>
          )}
        </div>
      </Card>

      {/* Attribution Details */}
      <Card className="flex-1 p-0 bg-slate-900/50">
        <CardHeader title="Attribution Details" />
        <div className="p-6 space-y-6">
          {selectedAttribution ? (
            <>
              {/* Actor Profile */}
              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Threat Actor Profile</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Name:</span>
                    <span className="text-slate-200 font-medium">{selectedAttribution.actor.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Sophistication:</span>
                    <Badge variant={getSophisticationColor(selectedAttribution.actor.sophistication) as any}>
                      {selectedAttribution.actor.sophistication}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Origin:</span>
                    <Badge variant="info" className="font-mono">{selectedAttribution.actor.origin}</Badge>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500 text-sm">Aliases:</span>
                    <div className="text-right flex flex-wrap gap-1 justify-end">
                      {selectedAttribution.actor.aliases.map(alias => (
                        <Badge key={alias} variant="secondary" className="text-xs">{alias}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attribution Metrics */}
              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Attribution Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500 text-sm">Attribution Score</span>
                      <span className="text-red-400 font-bold">{selectedAttribution.score}/100</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                        style={{ width: `${selectedAttribution.score}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500 text-sm">Confidence Level</span>
                      <span className="text-red-400 font-bold">{Math.round(selectedAttribution.confidence * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all"
                        style={{ width: `${selectedAttribution.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Matching Indicators */}
              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Matching Indicators</h3>
                <div className="space-y-2">
                  {selectedAttribution.matches.map((match, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-2 rounded text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{match.type}</Badge>
                        <span className="text-slate-300">{match.value}</span>
                      </div>
                      <span className="text-red-400 font-medium">Weight: {match.weight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Chain */}
              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Evidence Chain</h3>
                <div className="space-y-3">
                  {selectedAttribution.evidenceChain.map((evidence, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-red-500/30">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-950" />
                      <div className="text-xs">
                        <Badge variant="secondary" className="mb-2">{evidence.type}</Badge>
                        <div className="text-slate-300 mb-1">{evidence.description}</div>
                        <div className="text-slate-500">
                          Confidence: <span className="text-red-400">{Math.round(evidence.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm">
              Run attribution analysis to see results
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AttributionPanel;
