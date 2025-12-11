
import React, { useEffect, useState } from 'react';
import { threatData } from '../../services/dataLayer';
import { Threat, Case, SystemNode } from '../../types';
import { Icons } from '../Shared/Icons';

const StatCard = ({ title, value, color, icon }: any) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-${color}-500/50 transition-colors`}>
    <div>
      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</div>
      <div className="text-2xl font-mono text-white">{value}</div>
    </div>
    <div className={`p-3 rounded-full bg-${color}-500/10 text-${color}-500`}>{icon}</div>
  </div>
);

const Dashboard: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [nodes, setNodes] = useState<SystemNode[]>([]);

  useEffect(() => {
    // Data Layer Subscription for Real-time Updates
    const refresh = () => {
        setThreats(threatData.getThreats());
        setCases(threatData.getCases());
        setNodes(threatData.getNodes());
    };
    refresh();
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const criticalThreats = threats.filter(t => t.severity === 'CRITICAL').length;
  
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">Global Situational Awareness</h2>
            <p className="text-slate-400 text-sm">Real-time threat telemetry and operational status</p>
        </div>
        <div className="flex gap-3">
             <div className="px-4 py-2 bg-red-900/20 border border-red-900/50 text-red-500 rounded text-xs font-bold animate-pulse">
                DEFCON 3
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Threats" value={threats.length} color="cyan" icon={<Icons.Activity />} />
        <StatCard title="Open Cases" value={cases.length} color="blue" icon={<Icons.Briefcase />} />
        <StatCard title="Critical Alerts" value={criticalThreats} color="red" icon={<Icons.Alert />} />
        <StatCard title="Assets Monitored" value={nodes.length} color="emerald" icon={<Icons.Cpu />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10"></div>
            <h3 className="text-white font-bold text-sm mb-4">Threat Vector Map</h3>
            <div className="flex-1 border border-dashed border-slate-800 rounded flex items-center justify-center text-slate-600">
                [WEBGL GLOBE RENDER TARGET]
            </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col">
            <h3 className="text-white font-bold text-sm mb-4">Ingestion Feed</h3>
            <div className="flex-1 overflow-y-auto space-y-3">
                {threats.slice(0, 5).map(t => (
                    <div key={t.id} className="p-3 bg-slate-900 rounded border border-slate-800 text-xs">
                        <div className="flex justify-between mb-1">
                            <span className={`font-bold ${t.severity === 'CRITICAL' ? 'text-red-500' : 'text-cyan-500'}`}>{t.type}</span>
                            <span className="text-slate-500">{t.lastSeen}</span>
                        </div>
                        <div className="text-slate-300 font-mono">{t.indicator}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
