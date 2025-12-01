
import React, { useState } from 'react';
import { Card, Button, TextArea, Badge, Input, CardHeader } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { ParserRule } from '../../types';

const MOCK_PARSERS: ParserRule[] = [
  { id: 'p1', name: 'Apache Access Log', sourceType: 'Web Server', pattern: '([\\d.]+) - - \\[.*\\] "(\\w+) (.*?) HTTP/1.1" (\\d+) (\\d+)', sampleLog: '192.168.1.50 - - [10/Oct/2023:13:55:36 -0700] "GET /admin/config.php HTTP/1.1" 200 2326', status: 'ACTIVE', performance: 'FAST' },
  { id: 'p2', name: 'Cisco IOS Syslog', sourceType: 'Firewall', pattern: '%ASA-\\d-\\d+: .*', sampleLog: '%ASA-4-106023: Deny tcp src outside:192.0.2.1/50232 dst inside:10.0.0.5/80 by access-group "acl_out"', status: 'ACTIVE', performance: 'MODERATE' },
  { id: 'p3', name: 'Custom App Error', sourceType: 'App', pattern: 'ERROR: .*', sampleLog: 'INFO: Application started successfully.', status: 'INACTIVE', performance: 'FAST' }
];

const ParsersView: React.FC = () => {
  const [parsers, setParsers] = useState<ParserRule[]>(MOCK_PARSERS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; groups?: string[] } | null>(null);

  const toggleStatus = (id: string) => {
    setParsers(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : p));
  };

  const analyzePerformance = (pattern: string): 'FAST' | 'MODERATE' | 'SLOW' => {
    if (pattern.includes('.*') && pattern.length < 15) return 'SLOW'; // "Evil regex" heuristic
    if (pattern.length > 100) return 'MODERATE';
    return 'FAST';
  };

  const handleTest = (parser: ParserRule) => {
    try {
      const regex = new RegExp(parser.pattern);
      const match = regex.exec(parser.sampleLog);
      if (match) {
        setTestResult({ success: true, message: `Match Successful.`, groups: Array.from(match).slice(1) });
      } else {
        setTestResult({ success: false, message: 'No match found in sample log.' });
      }
    } catch (e) {
      setTestResult({ success: false, message: 'Invalid Regex Syntax.' });
    }
  };

  const updateParser = (id: string, field: keyof ParserRule, value: string) => {
    setParsers(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, [field]: value };
      if (field === 'pattern') updated.performance = analyzePerformance(value);
      return updated;
    }));
    setTestResult(null);
  };

  return (
    <Card className="p-0 overflow-hidden flex flex-col h-full">
      <CardHeader 
        title="Log Extraction Rules" 
        action={<Button onClick={() => alert("New Parser Wizard")} className="text-[10px] py-1">+ NEW PARSER</Button>}
      />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {parsers.map(parser => (
          <div key={parser.id} className={`border rounded-lg overflow-hidden transition-all duration-300 ${expandedId === parser.id ? 'border-cyan-500 ring-1 ring-cyan-500/20 bg-slate-900' : 'border-slate-800 bg-slate-950'}`}>
            <div 
              className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-slate-900"
              onClick={() => setExpandedId(expandedId === parser.id ? null : parser.id)}
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${parser.status === 'ACTIVE' ? 'bg-cyan-900/20 text-cyan-500' : 'bg-slate-800 text-slate-500'}`}>
                  <Icons.Code className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    {parser.name}
                    {parser.performance === 'SLOW' && <Icons.AlertTriangle className="w-3 h-3 text-red-500" />}
                  </div>
                  <div className="text-xs text-slate-500">{parser.sourceType}</div>
                </div>
              </div>
              <div className="flex items-center justify-between w-full md:w-auto gap-4 mt-2 md:mt-0">
                <div className="flex gap-2">
                   <Badge color={parser.performance === 'FAST' ? 'green' : parser.performance === 'MODERATE' ? 'orange' : 'red'}>{parser.performance}</Badge>
                   <Badge color={parser.status === 'ACTIVE' ? 'blue' : 'slate'}>{parser.status}</Badge>
                </div>
                <Icons.Layers className={`w-4 h-4 text-slate-500 transition-transform ${expandedId === parser.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {expandedId === parser.id && (
              <div className="p-4 border-t border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Regex Pattern</label>
                      <span className={`text-[10px] font-mono ${parser.performance === 'SLOW' ? 'text-red-500' : 'text-green-500'}`}>
                        {parser.performance === 'SLOW' ? '⚠ Performance Risk Detected' : '✓ Pattern Optimized'}
                      </span>
                    </div>
                    <Input 
                      value={parser.pattern} 
                      onChange={e => updateParser(parser.id, 'pattern', e.target.value)} 
                      className="font-mono text-xs text-yellow-400 bg-slate-900 border-slate-700" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Sample Log</label>
                    <TextArea 
                      value={parser.sampleLog} 
                      onChange={e => updateParser(parser.id, 'sampleLog', e.target.value)}
                      className="h-[38px] font-mono text-xs text-slate-300 bg-slate-900 border-slate-700 overflow-hidden" 
                    />
                  </div>
                </div>
                
                {testResult && (
                  <div className={`p-3 rounded text-xs border flex flex-col gap-2 ${testResult.success ? 'bg-green-900/10 border-green-900/50' : 'bg-red-900/10 border-red-900/50'}`}>
                    <div className={testResult.success ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      {testResult.success ? <Icons.CheckCircle className="w-3 h-3 inline mr-2" /> : <Icons.AlertTriangle className="w-3 h-3 inline mr-2" />}
                      {testResult.message}
                    </div>
                    {testResult.groups && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {testResult.groups.map((g, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-300 font-mono">
                            ${i + 1}: <span className="text-white">{g}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col-reverse md:flex-row gap-2 justify-end pt-2 border-t border-slate-800/50">
                  <Button onClick={(e) => { e.stopPropagation(); toggleStatus(parser.id); }} variant="secondary" className="w-full md:w-auto">
                    {parser.status === 'ACTIVE' ? 'DEACTIVATE RULE' : 'ACTIVATE RULE'}
                  </Button>
                  <Button onClick={(e) => { e.stopPropagation(); handleTest(parser); }} variant="primary" className="w-full md:w-auto">
                    TEST EXTRACTION
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ParsersView;
