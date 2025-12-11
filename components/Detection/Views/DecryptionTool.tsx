
import React, { useState } from 'react';
import { Card, CardHeader, Button, Select, Input } from '../../Shared/UI';
import { DetectionLogic } from '../../../services/logic/DetectionLogic';

export const DecryptionTool: React.FC = () => {
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
};
