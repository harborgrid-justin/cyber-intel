
import React, { useMemo } from 'react';
import { Card, Badge, Grid, ProgressBar } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { IntelligenceLogic } from '../../services/logic/IntelligenceLogic';
import { StandardPage } from '../Shared/Layouts';
import { VIPProfile } from '../../types';

const ExecutiveProtection: React.FC = () => {
  const users = threatData.getSystemUsers().filter(u => u.roleId === 'ROLE-ADMIN' || u.clearance === 'TS/SCI' || u.isVIP);
  const breaches = threatData.getOsintBreaches();
  const social = threatData.getOsintSocial();
  const threats = threatData.getThreats();

  const profiles: VIPProfile[] = useMemo(() => {
    return users.map(u => IntelligenceLogic.calculateVIPRisk(u, breaches, social, threats))
                .sort((a, b) => b.doxxingProb - a.doxxingProb);
  }, [users, breaches, social, threats]);

  return (
    <StandardPage title="Executive Digital Risk" subtitle="VIP & C-Suite Protection Program" modules={[]} activeModule="" onModuleChange={() => {}}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profiles.map(profile => (
          <Card key={profile.userId} className="p-0 overflow-hidden border-l-4 border-l-transparent hover:border-l-cyan-500 transition-all">
             <div className="bg-slate-950 p-6 flex flex-col md:flex-row gap-6 border-b border-slate-800">
                <div className="flex flex-col items-center">
                   <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl font-bold text-slate-400 mb-2">
                      {profile.name.substring(0, 2).toUpperCase()}
                   </div>
                   <Badge color="purple">VIP TRACKING</Badge>
                </div>
                
                <div className="flex-1">
                   <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                   <p className="text-sm text-cyan-500 font-mono mb-4">{profile.title}</p>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Doxxing Risk</span><span className={`font-bold ${profile.doxxingProb > 70 ? 'text-red-500' : 'text-yellow-500'}`}>{profile.doxxingProb}%</span></div>
                         <ProgressBar value={profile.doxxingProb} color={profile.doxxingProb > 70 ? 'red' : 'orange'} />
                      </div>
                      <div>
                         <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Phishing Vuln</span><span className={`font-bold ${profile.phishingSusceptibility > 50 ? 'text-orange-500' : 'text-green-500'}`}>{profile.phishingSusceptibility}%</span></div>
                         <ProgressBar value={profile.phishingSusceptibility} color={profile.phishingSusceptibility > 50 ? 'orange' : 'green'} />
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-4 grid grid-cols-3 gap-4 bg-slate-900/50">
                <div className="text-center">
                   <div className="text-2xl font-bold text-white">{profile.exposedCreds}</div>
                   <div className="text-[9px] text-slate-500 uppercase font-bold">Breach Hits</div>
                </div>
                <div className="text-center border-l border-slate-800">
                   <div className={`text-2xl font-bold ${profile.sentiment === 'Hostile' ? 'text-red-500' : 'text-slate-300'}`}>{profile.sentiment}</div>
                   <div className="text-[9px] text-slate-500 uppercase font-bold">Sentiment</div>
                </div>
                <div className="text-center border-l border-slate-800">
                   <div className="text-2xl font-bold text-white">{profile.recentMentions}</div>
                   <div className="text-[9px] text-slate-500 uppercase font-bold">Dark Web Mentions</div>
                </div>
             </div>
          </Card>
        ))}
        {profiles.length === 0 && <div className="text-center text-slate-500 col-span-2 py-12">No VIP profiles configured. Add users with 'C-Suite' role.</div>}
      </div>
    </StandardPage>
  );
};
export default ExecutiveProtection;
