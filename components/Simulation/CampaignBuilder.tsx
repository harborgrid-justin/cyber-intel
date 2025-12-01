
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, CardHeader } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { SimBuilderLogic, CampaignStep } from '../../services/logic/SimBuilderLogic';

const CampaignBuilder: React.FC = () => {
  const [chain, setChain] = useState<CampaignStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<CampaignStep | null>(null);
  const [budget] = useState(5000);
  const library = SimBuilderLogic.getLibrary();
  const metrics = SimBuilderLogic.calculateMetrics(chain);
  const validation = SimBuilderLogic.validateChain(chain);

  // DnD Handlers
  const handleDragStart = (e: React.DragEvent, type: string, data: string) => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('data', data);
  };

  const handleDrop = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    const data = e.dataTransfer.getData('data'); // TTP Name or Index

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

  const updateStep = (uuid: string, field: string, val: any) => {
    setChain(prev => prev.map(s => s.uuid === uuid ? { ...s, [field]: val } : s));
    if (selectedStep?.uuid === uuid) setSelectedStep(prev => prev ? { ...prev, [field]: val } : null);
  };

  const saveCampaign = () => localStorage.setItem('SAVED_CAMPAIGN', JSON.stringify(chain));
  const loadCampaign = () => { const s = localStorage.getItem('SAVED_CAMPAIGN'); if(s) setChain(JSON.parse(s)); };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(chain, null, 2)], {type: 'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'campaign.json'; a.click();
  };

  return (
    <div className="flex h-full gap-4">
      {/* Library */}
      <Card className="w-64 flex flex-col p-0 overflow-hidden bg-slate-950">
        <CardHeader title="TTP Library" />
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {library.map(t => (
            <div key={t.id} draggable onDragStart={e => handleDragStart(e, 'NEW_TTP', t.name)} 
                 className="p-3 bg-slate-900 border border-slate-800 rounded cursor-move hover:border-cyan-500 group">
              <div className="font-bold text-xs text-white">{t.name}</div>
              <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                <span>{t.mitreId}</span><span className="text-green-500">${t.cost}</span>
              </div>
              {t.requires && <div className="text-[9px] text-red-400 mt-1">Requires: {t.requires.join(', ')}</div>}
            </div>
          ))}
        </div>
      </Card>

      {/* Canvas */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
           <div className="flex gap-2">
             <Button onClick={saveCampaign} variant="secondary" className="text-[10px] h-8">SAVE</Button>
             <Button onClick={loadCampaign} variant="secondary" className="text-[10px] h-8">LOAD</Button>
             <Button onClick={() => setChain(SimBuilderLogic.autoOptimize(chain))} variant="outline" className="text-[10px] h-8">AUTO-FIX</Button>
             <Button onClick={exportJson} variant="outline" className="text-[10px] h-8">EXPORT</Button>
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
            const def = SimBuilderLogic.getDef(step.ttpId)!;
            const isInvalid = validation.invalidIndices.includes(idx);
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
                {step.notes && <Icons.FileText className="w-4 h-4 text-slate-500" />}
                <div className="text-xs text-slate-500">${def.cost}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Config Panel */}
      {selectedStep && (
        <Card className="w-72 flex flex-col p-0 overflow-hidden bg-slate-950 border-l border-slate-800">
           <CardHeader title="Step Configuration" />
           <div className="p-4 space-y-4">
              <div>
                 <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">TTP Name</div>
                 <div className="text-sm font-bold text-white">{selectedStep.ttpId}</div>
              </div>
              <div>
                 <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Notes</div>
                 <Input value={selectedStep.notes || ''} onChange={e => updateStep(selectedStep.uuid, 'notes', e.target.value)} placeholder="Op Notes" />
              </div>
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                 <div className="text-[10px] font-mono text-cyan-500 mb-2">PARAM_CONFIG</div>
                 <Input className="mb-2 text-xs" placeholder="Target IP/User" value={selectedStep.config?.target || ''} onChange={e => updateStep(selectedStep.uuid, 'config', {...selectedStep.config, target: e.target.value})} />
                 <Input className="text-xs" placeholder="Tool Override" value={selectedStep.config?.tool || ''} onChange={e => updateStep(selectedStep.uuid, 'config', {...selectedStep.config, tool: e.target.value})} />
              </div>
              <Button onClick={() => { setChain(chain.filter(s => s.uuid !== selectedStep.uuid)); setSelectedStep(null); }} variant="danger" className="w-full">REMOVE STEP</Button>
           </div>
        </Card>
      )}
    </div>
  );
};
export default CampaignBuilder;
