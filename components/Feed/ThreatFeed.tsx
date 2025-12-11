
import React, { useState, useEffect } from 'react';
import { threatData } from '../../services/dataLayer';
import { Threat } from '../../types';
import { Icons } from '../Shared/Icons';

const ThreatFeed: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setThreats(threatData.getThreats());
  }, []);

  const handlePromote = (id: string) => {
    threatData.createCaseFromThreat(id);
    alert("Case Created from Threat " + id);
  };

  const filtered = threats.filter(t => 
    t.indicator.toLowerCase().includes(search.toLowerCase()) || 
    t.threatActor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Global Threat Intelligence</h2>
        <div className="relative">
            <Icons.Shield className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
                type="text" 
                placeholder="Search IoCs..." 
                className="bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-500 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 bg-slate-900/50 p-3 text-xs font-bold text-slate-500 uppercase border-b border-slate-800">
            <div className="col-span-1">Sev</div>
            <div className="col-span-3">Indicator</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Actor</div>
            <div className="col-span-1">Score</div>
            <div className="col-span-3 text-right">Actions</div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {filtered.map(t => (
                <div key={t.id} className="grid grid-cols-12 p-4 border-b border-slate-800 hover:bg-slate-900/40 transition-colors items-center text-sm">
                    <div className="col-span-1">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${t.severity === 'CRITICAL' ? 'bg-red-900/30 text-red-500 border border-red-900' : 'bg-cyan-900/30 text-cyan-500 border border-cyan-900'}`}>
                            {t.severity}
                        </span>
                    </div>
                    <div className="col-span-3 font-mono text-slate-300">{t.indicator}</div>
                    <div className="col-span-2 text-slate-400">{t.type}</div>
                    <div className="col-span-2 text-slate-400">{t.threatActor || 'Unknown'}</div>
                    <div className="col-span-1 font-mono text-cyan-500">{t.score}</div>
                    <div className="col-span-3 flex justify-end gap-2">
                        <button onClick={() => handlePromote(t.id)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors">
                            Promote
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatFeed;
