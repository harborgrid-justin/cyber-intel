
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Badge, ProgressBar, Input, Button, Select, Grid } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { DetectionLogic } from '../../../services/logic/DetectionLogic';

export const AdvancedViews = {
  Ueba: () => {
    const users = useDataStore(() => threatData.getSystemUsers());
    const logs = useDataStore(() => threatData.getAuditLogs());
    const [scores, setScores] = useState<Record<string, number>>({});

    useEffect(() => {
        const run = async () => {
            const results: Record<string, number> = {};
            for(const u of users) {
                results[u.id] = await DetectionLogic.runUEBA(u, logs);
            }
            setScores(results);
        };
        run();
    }, [users]); // logs omitted to avoid rapid re-runs
    
    return (
      <Grid cols={3}>
        {users.map(u => {
          const score = scores[u.id] || 0;
          return (
            <Card key={u.id} className="p-4 border-l-4 border-slate-700">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-white">{u.name}</span>
                <span className={`font-bold ${score > 50 ? 'text-red-500' : 'text-green-500'}`}>{score}/100</span>
              </div>
              <ProgressBar value={score} color={score > 50 ? 'red' : 'green'} />
              <div className="mt-3 text-xs text-slate-500">
                {score > 50 ? 'Anomalous login times & failures detected.' : 'Behavior within normal baseline.'}
              </div>
            </Card>
          );
        })}
      </Grid>
    );
  },

  Anomaly: () => {
    const nodes = useDataStore(() => threatData.getSystemNodes());
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nodes.map(n => (
          <Card key={n.id} className="p-6">
            <CardHeader title={n.name} className="p-0 border-0 bg-transparent mb-4" />
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>CPU Deviation</span><span>{n.load > 80 ? '+2.4σ' : '+0.1σ'}</span></div>
                <ProgressBar value={n.load} color={n.load > 80 ? 'red' : 'blue'} />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Network Outbound</span><span>{n.load > 50 ? 'High' : 'Normal'}</span></div>
                <div className="h-10 flex items-end gap-1 mt-2">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="flex-1 bg-slate-800 hover:bg-cyan-500 transition-colors" style={{ height: `${Math.random() * (n.load > 80 ? 100 : 40)}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  },

  Decryption: () => {
    const [input, setInput] = useState('');
    const [method, setMethod] = useState<'BASE64' | 'HEX' | 'XOR'>('BASE64');
    const [key, setKey] = useState('');
    const [output, setOutput] = useState('');

    const handleDecode = () => {
      setOutput(DetectionLogic.decrypt(input, method, key));
    };

    return (
      <Card className="h-full p-0 flex flex-col">
        <CardHeader title="CyberChef Lite" />
        <div className="p-6 space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Input Payload</label>
              <textarea value={input} onChange={e => setInput(e.target.value)} className="w-full h-32 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300" placeholder="Paste obfuscated text..." />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Decoded Output</label>
              <textarea readOnly value={output} className="w-full h-32 bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-green-400" placeholder="Result will appear here..." />
            </div>
          </div>
          <div className="flex gap-4 items-end bg-slate-900/50 p-4 rounded border border-slate-800">
            <div className="w-48">
              <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Operation</label>
              <Select value={method} onChange={e => setMethod(e.target.value as any)}>
                <option value="BASE64">From Base64</option>
                <option value="HEX">From Hex</option>
                <option value="XOR">XOR Brute/Key</option>
              </Select>
            </div>
            {method === 'XOR' && (
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Key</label>
                <Input value={key} onChange={e => setKey(e.target.value)} placeholder="Secret Key" />
              </div>
            )}
            <Button onClick={handleDecode} variant="primary">BAKE RECIPE</Button>
          </div>
        </div>
      </Card>
    );
  }
};
