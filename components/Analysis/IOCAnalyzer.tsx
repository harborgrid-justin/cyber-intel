import React, { useState } from 'react';
import { Card, TextArea, Button, Badge, CardHeader } from '../Shared/UI';

interface ExtractedIOC {
  type: string;
  value: string;
  confidence: number;
  context?: string;
}

const IOCAnalyzer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [extractedIOCs, setExtractedIOCs] = useState<ExtractedIOC[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const handleExtract = async () => {
    setAnalyzing(true);

    // Simulated IOC extraction
    setTimeout(() => {
      const mockIOCs: ExtractedIOC[] = [
        { type: 'IP', value: '192.168.1.100', confidence: 0.95 },
        { type: 'DOMAIN', value: 'malicious-site.com', confidence: 0.90 },
        { type: 'HASH_SHA256', value: 'a7f2c1e8b9d4f6e3c5a8b2d9f4e7c1a6', confidence: 0.98 },
        { type: 'EMAIL', value: 'attacker@evil.com', confidence: 0.85 },
        { type: 'URL', value: 'https://malware-host.net/payload.exe', confidence: 0.92 }
      ];

      setExtractedIOCs(mockIOCs);
      setSummary({
        total: mockIOCs.length,
        by_type: {
          'IP': 1,
          'DOMAIN': 1,
          'HASH_SHA256': 1,
          'EMAIL': 1,
          'URL': 1
        }
      });
      setAnalyzing(false);
    }, 1500);
  };

  const loadSample = () => {
    setInputText(`Incident Report #2025-001

Detected malicious activity from IP address 192.168.1.100 attempting to contact
C2 server at malicious-site.com. The payload with SHA256 hash
a7f2c1e8b9d4f6e3c5a8b2d9f4e7c1a6 was delivered via phishing email from
attacker@evil.com. Additional artifacts found at URL:
https://malware-host.net/payload.exe`);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'IP': 'cyan',
      'DOMAIN': 'purple',
      'URL': 'orange',
      'EMAIL': 'green',
      'HASH_SHA256': 'red',
      'HASH_MD5': 'red',
      'HASH_SHA1': 'red'
    };
    return colors[type] || 'gray';
  };

  const exportIOCs = (format: 'JSON' | 'CSV' | 'STIX') => {
    if (format === 'JSON') {
      const json = JSON.stringify(extractedIOCs, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'iocs.json';
      a.click();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <Card className="flex-1 flex flex-col p-0 border-cyan-500/20 shadow-lg shadow-cyan-900/10 overflow-hidden">
        <CardHeader
          title={<><span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>IOC Extraction</>}
          action={<Button onClick={loadSample} variant="text" className="text-xs text-slate-500">Load Sample</Button>}
        />
        <div className="flex-1 p-4 flex flex-col">
          <TextArea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste threat intelligence reports, logs, or security alerts here to extract IOCs..."
            className="flex-1 bg-slate-950 border-slate-800 text-slate-300 font-mono text-sm p-4 rounded-lg resize-none focus:border-cyan-500 transition-colors"
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={handleExtract} disabled={analyzing || !inputText} variant="primary" className="w-full md:w-auto">
              {analyzing ? 'Extracting IOCs...' : 'Extract Indicators'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="flex-1 flex flex-col p-0 bg-slate-900/50 overflow-hidden">
        <CardHeader
          title={<>Extracted IOCs {summary && `(${summary.total})`}</>}
          action={
            extractedIOCs.length > 0 && (
              <div className="flex gap-2">
                <Button onClick={() => exportIOCs('JSON')} variant="text" className="text-xs text-cyan-400">
                  Export JSON
                </Button>
                <Button onClick={() => exportIOCs('STIX')} variant="text" className="text-xs text-cyan-400">
                  Export STIX
                </Button>
              </div>
            )
          }
        />
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar p-6">
          {analyzing ? (
            <div className="h-full flex items-center justify-center flex-col gap-4">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-xs text-cyan-500 font-mono animate-pulse">Analyzing text and extracting indicators...</div>
            </div>
          ) : extractedIOCs.length > 0 ? (
            <>
              {/* Summary */}
              {summary && (
                <div className="bg-slate-950/50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Total IOCs:</span>
                      <div className="text-cyan-400 font-bold text-lg">{summary.total}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Unique Types:</span>
                      <div className="text-cyan-400 font-bold text-lg">{Object.keys(summary.by_type).length}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* IOC List */}
              <div className="space-y-2">
                {extractedIOCs.map((ioc, idx) => (
                  <div key={idx} className="bg-slate-950/50 rounded-lg p-3 border border-slate-800 hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={getTypeColor(ioc.type) as any} className="text-xs">
                        {ioc.type}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Confidence:</span>
                        <Badge variant={ioc.confidence > 0.9 ? 'success' : ioc.confidence > 0.7 ? 'warning' : 'info'} className="text-xs">
                          {Math.round(ioc.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="font-mono text-sm text-cyan-400 break-all">{ioc.value}</div>
                    {ioc.context && (
                      <div className="mt-2 text-xs text-slate-500 italic line-clamp-2">
                        Context: {ioc.context}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm">
              No IOCs extracted yet. Paste text and click "Extract Indicators" to begin.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default IOCAnalyzer;
