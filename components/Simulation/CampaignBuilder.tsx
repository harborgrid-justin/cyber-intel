
import React, { useState, useEffect } from 'react';
import { Button, Badge } from '../Shared/UI';
import { SimBuilderLogic, CampaignStep } from '../../services/logic/SimBuilderLogic';
import { TTPDef } from '../../types';
import { TtpLibrary } from './TtpLibrary';

const CampaignBuilder: React.FC = () => {
  const [chain, setChain] = useState<CampaignStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<CampaignStep | null>(null);
  const [budget] = useState(5000);
  const [library, setLibrary] = useState<TTPDef[]>([]);
  const [metrics, setMetrics] = useState({ cost: 0, noise: 0, success: 0, iocCount: 0 });
  const [validation, setValidation] = useState<{ valid: boolean, invalidIndices: number[] }>({ valid: true, invalidIndices: [] });

  useEffect(() => {
    SimBuilderLogic.getLibrary().then(setLibrary);
  }, []);

  useEffect(() => {
    const runAnalysis = async () => {
        const m = await SimBuilderLogic.calculateMetrics(chain);
        setMetrics(m);
        const v = await SimBuilderLogic.validateChain(chain);
        setValidation(v);
    };
    runAnalysis();
  }, [chain]);

  const handleDragStart = (e: React.DragEvent, type: string, data: string) => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('data', data);
  };

  const handleDrop = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    const data = e.dataTransfer.getData('data');

    if (type === 'NEW_TTP') {
      const ttp = library.find(t => t.name === data);
      if (ttp) {
        const newStep: CampaignStep = { uuid: `s-${Date.now()}`, ttpId: ttp.name, config: { duration: 1 } };
        const newChain = [...chain];
        if (index !== undefined) newChain.splice(index, 0, newStep);
        else newChain.push(newStep);
        setChain(newChain);
      }
    } else if (type === 'MOVE_STEP') {
      const oldIdx = parseInt(data);
      const newChain = [...chain];
      const [removed] = newChain.splice(oldIdx, 1);
      const targetIdx = index !== undefined ? index : newChain.length;
      newChain.splice(targetIdx, 0, removed);
      setChain(newChain);
    }
  };

  const handleAutoFix = async () => {
      const optimized = await SimBuilderLogic.autoOptimize(chain);
      setChain(optimized);
  };

  return (
    <div className="flex h-full gap-4">
      {/* Library */}
      <TtpLibrary library={library} onDragStart={handleDragStart} />

      {/* Canvas */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
           <div className="flex gap-2">
             <Button onClick={() => {}} variant="secondary" className="text-[10px] h-8">SAVE</Button>
             <Button onClick={handleAutoFix} variant="outline" className="text-[10px] h-8">AUTO-FIX</Button>
             <Button onClick={() => setChain([])} variant="danger" className="text-[10px] h-8">CLEAR</Button>
           </div>
           <div className="flex items-center gap-4 text-xs font-mono">
              <span className={metrics.cost > budget ? 'text-red-500' : 'text-green-500'}>${metrics.cost} / ${budget}</span>
              <span className="text-cyan-400">{metrics.success}% Prob</span>
              <span className={metrics.noise > 50 ? 'text-orange-500' : 'text-blue-400'}>{metrics.noise}% Noise</span>
           </div>
        </div>

        <div className="flex-1 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-xl relative overflow-y-auto p-4 space-y-2"
             onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e)}>
          {chain.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-600 pointer-events-none font-bold tracking-widest">DRAG TTPs HERE</div>}
          
          {chain.map((step, idx) => {
            const def = SimBuilderLogic.getDef(step.ttpId);
            const isInvalid = validation.invalidIndices.includes(idx);
            if (!def) return null;
            return (
              <div key={step.uuid} draggable onDragStart={e => handleDragStart(e, 'MOVE_STEP', idx.toString())}
                   onDragOver={e => e.preventDefault()} onDrop={e => { e.stopPropagation(); handleDrop(e, idx); }}
                   onClick={() => setSelectedStep(step)}
                   className={`p-3 rounded border flex items-center gap-4 cursor-pointer transition-all ${selectedStep?.uuid === step.uuid ? 'bg-cyan-900/20 border-cyan-500' : 'bg-slate-950 border-slate-800'} ${isInvalid ? 'border-red-500 bg-red-900/10' : ''}`}>
                <div className="text-slate-500 font-mono text-xs w-6">{idx+1}</div>
                <Badge color={def.stage === 'Exfil' ? 'red' : 'blue'}>{def.stage}</Badge>
                <div className="flex-1">
                    <div className="font-bold text-sm text-slate-200">{def.name}</div>
                    {isInvalid && <div className="text-[10px] text-red-400 font-bold">⚠ Prerequisite Missing</div>}
                </div>
                <div className="text-xs text-slate-500">${def.cost}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default CampaignBuilder;
