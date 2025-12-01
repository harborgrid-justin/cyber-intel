
import React, { useState } from 'react';
import { Card, CardHeader, Badge, Button, Grid, ProgressBar } from '../../Shared/UI';
import { Malware, ForensicJob } from '../../../types';
import { ForensicsLogic } from '../../../services/logic/ForensicsLogic';
import { threatData } from '../../../services/dataLayer';

// --- Malware Vault ---
export const MalwareVaultView: React.FC<{ data: Malware[] }> = ({ data }) => {
  const [detonating, setDetonating] = useState<string | null>(null);

  const handleDetonate = (id: string) => {
    setDetonating(id);
    setTimeout(() => {
        setDetonating(null);
        alert(`Analysis Complete: Sandbox report generated for ${id}`);
    }, 2000);
  };

  return (
    <div className="h-full overflow-y-auto">
      <Grid cols={3}>{data.map(m => {
        const risk = ForensicsLogic.assessMalwareRisk(m);
        return (
            <Card key={m.id} className="p-4 border-l-4 border-l-red-600 flex flex-col justify-between group">
                <div>
                    <div className="flex justify-between mb-2"><h4 className="text-white font-bold">{m.name}</h4><Badge color="red">{risk}/100 RISK</Badge></div>
                    <div className="text-xs text-slate-400 mb-2 font-mono">{m.family}</div>
                    <div className="text-[9px] bg-slate-950 p-2 rounded font-mono text-slate-600 mb-3 truncate">{m.hash}</div>
                </div>
                <Button onClick={() => handleDetonate(m.id)} disabled={detonating === m.id} variant="danger" className="w-full text-[10px]">
                    {detonating === m.id ? 'DETONATING...' : 'EXECUTE IN SANDBOX'}
                </Button>
            </Card>
        );
      })}</Grid>
    </div>
  );
};

// --- Forensics Lab ---
export const ForensicsLabView: React.FC<{ jobs: ForensicJob[] }> = ({ jobs }) => {
  const handleCreateJob = () => {
    threatData.addForensicJob({ id: `JOB-${Date.now()}`, type: 'Disk Imaging', target: 'Server-01', status: 'QUEUED', progress: 0, technician: 'Unassigned' });
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <Card className="shrink-0 p-6 flex justify-between items-center bg-slate-900 border-slate-800">
         <div><h3 className="text-lg font-bold text-white">Active Operations</h3><p className="text-xs text-slate-500">{jobs.filter(j => j.status === 'PROCESSING').length} Jobs Running</p></div>
         <Button onClick={handleCreateJob} variant="primary">+ QUEUE JOB</Button>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
        {jobs.map(j => (
            <Card key={j.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500">{j.id}</span>
                    <Badge color={j.status === 'COMPLETED' ? 'green' : j.status === 'PROCESSING' ? 'blue' : 'slate'}>{j.status}</Badge>
                </div>
                <div>
                    <div className="font-bold text-white text-sm">{j.type}</div>
                    <div className="text-xs text-cyan-500">{j.target}</div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400"><span>Progress</span><span>{j.progress}%</span></div>
                    <ProgressBar value={j.progress} color={j.status === 'FAILED' ? 'red' : 'cyan'} />
                </div>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                    <span>Tech: {j.technician}</span>
                    <button className="text-cyan-500 hover:underline">DETAILS</button>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
};
