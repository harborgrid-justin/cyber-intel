
import React, { useState } from 'react';
import { Card, TextArea, Button, Badge, CardHeader } from '../Shared/UI';
import { ThreatLogic } from '../../services/logic/ThreatLogic';

const AttributionEngine: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const matches = await ThreatLogic.calculateAttribution(input);
    setResults(matches);
    setAnalyzing(false);
  };

  const loadSample = () => {
    setInput("Detected C2 beaconing to 192.168.1.105 using process hollowing (T1093) on a Finance server. Payload hash starts with 7a0d. Possible Spearphishing Attachment (T1566.001) vector.");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
      <Card className="flex-1 flex flex-col p-0 border-cyan-500/20 shadow-lg shadow-cyan-900/10 overflow-hidden">
        <CardHeader 
          title={<><span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>Forensic Artifact Input</>} 
          action={<Button onClick={loadSample} variant="text" className="text-xs text-slate-500">Load Sample</Button>}
        />
        <div className="flex-1 p-4 flex flex-col">
          <TextArea 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Paste Incident Logs, IoCs, or Intelligence Reports here for attribution analysis..." 
            className="flex-1 bg-slate-950 border-slate-800 text-slate-300 font-mono text-sm p-4 rounded-lg resize-none focus:border-cyan-500 transition-colors"
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={handleAnalyze} disabled={analyzing || !input} variant="primary" className="w-full md:w-auto">
              {analyzing ? 'RUNNING PROBABILISTIC MODELS...' : 'CALCULATE ATTRIBUTION'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="flex-1 flex flex-col p-0 bg-slate-900/50 overflow-hidden">
        <CardHeader title="Attribution Probabilities" />
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar p-6">
          {analyzing ? (
             <div className="h-full flex items-center justify-center flex-col gap-4">
               <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
               <div className="text-xs text-cyan-500 font-mono animate-pulse">MATCHING TTPs VIA BACKEND ENGINE...</div>
             </div>
          ) : results.length > 0 ? (
            results.map((res, idx) => (
              <div key={res.actor.id} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group hover:border-cyan-500/50 transition-all">
                <div className="p-4 flex justify-between items-center bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-bold text-white group-hover:text-cyan-400">{res.actor.name}</div>
                    <Badge color="slate">{res.actor.origin}</Badge>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold font-mono ${res.score > 80 ? 'text-red-500' : res.score > 50 ? 'text-orange-500' : 'text-slate-500'}`}>
                      {res.score}%
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Confidence</div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-slate-800 space-y-3">
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className={`h-full ${res.score > 80 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${res.score}%` }}></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {res.matches.map((m: any, i: number) => (
                      <span key={i} className={`text-[10px] px-2 py-1 rounded border font-mono flex items-center gap-2 ${
                        m.type === 'INFRA' ? 'bg-red-900/20 text-red-400 border-red-900/50' :
                        m.type === 'TTP' ? 'bg-purple-900/20 text-purple-400 border-purple-900/50' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        <span className="font-bold">{m.type}</span> {m.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-lg h-full">
              <span className="text-xs uppercase tracking-widest font-bold">Awaiting Input Data</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AttributionEngine;
