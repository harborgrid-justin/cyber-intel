import React from 'react';
import NetworkGraph from '../../Shared/NetworkGraph';

export const IncidentNetwork: React.FC<{ threats: any[] }> = ({ threats }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Topology & Lateral Movement</h3>
            <div className="flex gap-4 text-xs text-slate-400">
                <span>Nodes: {threats.length}</span>
                <span>Edges: {Math.round(threats.length * 1.5)}</span>
                <span className="text-red-400 font-bold">Infected: {threats.filter(t => t.severity === 'CRITICAL').length}</span>
            </div>
        </div>
        <div className="flex-1 w-full max-w-4xl mx-auto border border-slate-800 rounded bg-slate-950/50">
            <NetworkGraph threats={threats} />
        </div>
    </div>
);

export default IncidentNetwork;
