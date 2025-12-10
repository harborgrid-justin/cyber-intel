
import React, { useState } from 'react';
import { Card, CardHeader, Button, TextArea } from '../../Shared/UI';
import { DetectionLogic } from '../../../services/logic/DetectionLogic';
import { SimHash } from '../../../services/algorithms/SimHash';

export const IntelTools: React.FC = () => {
  const [tool, setTool] = useState<'DECRYPT' | 'TRANSLATE' | 'SIMHASH'>('DECRYPT');
  const [input, setInput] = useState('');
  const [input2, setInput2] = useState('');
  const [output, setOutput] = useState('');
  
  const handleProcess = () => {
    if (tool === 'DECRYPT') {
        const res = DetectionLogic.decrypt(input, 'BASE64');
        setOutput(res);
    } else if (tool === 'SIMHASH') {
        const h1 = SimHash.compute(input);
        const h2 = SimHash.compute(input2 || input);
        const sim = SimHash.similarity(h1, h2);
        setOutput(`Hash 1: ${h1.toString(16)}\nHash 2: ${h2.toString(16)}\nSimilarity: ${(sim*100).toFixed(2)}%`);
    } else {
        setOutput(`[SIMULATION] Processing ${tool}... \nResult: Text processed successfully.`);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 h-full p-6">
      <Card className="flex flex-col p-0 overflow-hidden">
        <CardHeader title="Analyst Toolkit" />
        <div className="p-6 space-y-4 flex-1">
            <div className="flex gap-4">
                <Button onClick={() => setTool('DECRYPT')} variant={tool === 'DECRYPT' ? 'primary' : 'secondary'}>DECRYPTION</Button>
                <Button onClick={() => setTool('SIMHASH')} variant={tool === 'SIMHASH' ? 'primary' : 'secondary'}>SIMHASH COMPARE</Button>
                <Button onClick={() => setTool('TRANSLATE')} variant={tool === 'TRANSLATE' ? 'primary' : 'secondary'}>TRANSLATION</Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 h-96">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-2">Input Source A</label>
                        <TextArea value={input} onChange={e => setInput(e.target.value)} className="w-full bg-slate-950 font-mono text-xs h-32" placeholder="Paste data here..." />
                    </div>
                    {tool === 'SIMHASH' && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-2">Input Source B (Comparison)</label>
                            <TextArea value={input2} onChange={e => setInput2(e.target.value)} className="w-full bg-slate-950 font-mono text-xs h-32" placeholder="Paste second text..." />
                        </div>
                    )}
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-500 mb-2">Output</label>
                    <TextArea readOnly value={output} className="flex-1 bg-slate-900 border-slate-800 font-mono text-xs text-green-400" />
                </div>
            </div>
            
            <div className="flex justify-end">
                <Button onClick={handleProcess} variant="primary">EXECUTE OPERATION</Button>
            </div>
        </div>
      </Card>
    </div>
  );
};
