import React, { useState } from 'react';
import { Card, Button, Badge, CardHeader } from '../Shared/UI';

interface CorrelationEvent {
  id: string;
  timestamp: string;
  type: string;
  indicator: string;
  severity: string;
}

interface CorrelationResult {
  correlationId: string;
  correlationType: string;
  confidence: number;
  score: number;
  description: string;
  eventCount: number;
}

const ThreatCorrelation: React.FC = () => {
  const [events, setEvents] = useState<CorrelationEvent[]>([]);
  const [results, setResults] = useState<CorrelationResult[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const handleCorrelate = async () => {
    setAnalyzing(true);

    // Simulated correlation analysis
    setTimeout(() => {
      const mockResults: CorrelationResult[] = [
        {
          correlationId: 'TEMP-001',
          correlationType: 'TEMPORAL',
          confidence: 0.87,
          score: 85,
          description: '5 events detected within 30 minutes from 3 sources',
          eventCount: 5
        },
        {
          correlationId: 'INDIC-002',
          correlationType: 'INDICATOR',
          confidence: 0.92,
          score: 78,
          description: 'IOC "malicious-domain.com" detected across 3 events',
          eventCount: 3
        },
        {
          correlationId: 'BEHAV-003',
          correlationType: 'BEHAVIORAL',
          confidence: 0.76,
          score: 72,
          description: 'Attack pattern detected: Recon to Exploitation',
          eventCount: 4
        }
      ];
      setResults(mockResults);
      setAnalyzing(false);
    }, 2000);
  };

  const loadSample = () => {
    const sampleEvents: CorrelationEvent[] = [
      { id: '1', timestamp: '2025-12-12T10:00:00Z', type: 'Port Scan', indicator: '192.168.1.100', severity: 'MEDIUM' },
      { id: '2', timestamp: '2025-12-12T10:15:00Z', type: 'Exploit Attempt', indicator: 'CVE-2024-1234', severity: 'HIGH' },
      { id: '3', timestamp: '2025-12-12T10:20:00Z', type: 'C2 Beacon', indicator: 'malicious-domain.com', severity: 'CRITICAL' },
      { id: '4', timestamp: '2025-12-12T10:25:00Z', type: 'Data Exfiltration', indicator: '192.168.1.100', severity: 'CRITICAL' }
    ];
    setEvents(sampleEvents);
  };

  const getCorrelationColor = (type: string) => {
    const colors: Record<string, string> = {
      'TEMPORAL': 'cyan',
      'INDICATOR': 'purple',
      'BEHAVIORAL': 'orange',
      'SPATIAL': 'green',
      'CAMPAIGN': 'red'
    };
    return colors[type] || 'gray';
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <Card className="border-purple-500/20 shadow-lg shadow-purple-900/10">
        <CardHeader
          title={<><span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>Threat Event Correlation</>}
          action={
            <div className="flex gap-2">
              <Button onClick={loadSample} variant="text" className="text-xs text-slate-500">Load Sample</Button>
              <Button onClick={handleCorrelate} disabled={analyzing || events.length === 0} variant="primary">
                {analyzing ? 'Correlating...' : 'Analyze Correlations'}
              </Button>
            </div>
          }
        />

        <div className="space-y-4">
          {/* Events Section */}
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Security Events ({events.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {events.map(event => (
                <div key={event.id} className="flex items-center justify-between bg-slate-950/50 p-2 rounded text-xs">
                  <div className="flex items-center gap-3">
                    <Badge variant={event.severity === 'CRITICAL' ? 'danger' : event.severity === 'HIGH' ? 'warning' : 'info'}>
                      {event.severity}
                    </Badge>
                    <span className="text-slate-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    <span className="text-slate-300 font-medium">{event.type}</span>
                  </div>
                  <span className="text-cyan-400 font-mono">{event.indicator}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">Correlation Results</h3>
              {results.map(result => (
                <div key={result.correlationId} className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={getCorrelationColor(result.correlationType) as any}>
                        {result.correlationType}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-200">{result.description}</span>
                    </div>
                    <Badge variant="success" className="text-xs">
                      Score: {result.score}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Confidence:</span>
                      <div className="mt-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all"
                              style={{ width: `${result.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-purple-400 font-medium">{Math.round(result.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Events:</span>
                      <div className="mt-1 text-slate-300 font-medium">{result.eventCount} related events</div>
                    </div>
                    <div>
                      <span className="text-slate-500">ID:</span>
                      <div className="mt-1 text-slate-400 font-mono">{result.correlationId}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {analyzing && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xs text-purple-500 font-mono animate-pulse">Analyzing event correlations...</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ThreatCorrelation;
