




import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Grid, CardHeader, ProgressBar } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { OsintLogic } from '../../../services/logic/OsintLogic';
import { OsintBreach, OsintSocial, IdentityAnalysis, CredentialExposure } from '../../../types';

interface EnrichedSocial extends OsintSocial {
  botProbability: number;
  influence: IdentityAnalysis['influence'];
}

export const IdentityViews = {
  EmailBreach: () => {
    // Efficient Subscription
    const breaches = useDataStore(() => threatData.getOsintBreaches());
    
    const [searchEmail, setSearchEmail] = useState('');
    const [exposure, setExposure] = useState<CredentialExposure | null>(null);

    const handleCheck = async () => {
       setExposure(await OsintLogic.checkBreachExposure(searchEmail, breaches));
    };

    return (
      <div className="flex flex-col h-full gap-6">
         <Card className="p-0 shrink-0">
            <CardHeader title="Credential Exposure Check" />
            <div className="p-6 flex gap-4 bg-slate-900">
               <Input 
                 placeholder="target@company.com" 
                 value={searchEmail} 
                 onChange={e => setSearchEmail(e.target.value)} 
                 className="flex-1"
               />
               <Button onClick={handleCheck}>VERIFY</Button>
            </div>
            {exposure && (
               <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded border border-slate-800">
                     <div>
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Exposure Score</div>
                        <div className={`text-2xl font-bold ${exposure.score > 50 ? 'text-red-500' : 'text-yellow-500'}`}>{exposure.score}/100</div>
                        <ProgressBar value={exposure.score} color={exposure.score > 50 ? 'red' : 'yellow'} className="mt-2" />
                     </div>
                     <div>
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Compromised Data Types</div>
                        <div className="flex flex-wrap gap-1">
                           {exposure.types.map(t => <Badge key={t} color="red">{t}</Badge>)}
                           {exposure.types.length === 0 && <span className="text-green-500 text-sm font-bold">None Detected</span>}
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </Card>

         <Card className="flex-1 p-0 overflow-hidden flex flex-col">
            <CardHeader title="Known Breach Database" />
            <div className="flex-1 overflow-y-auto">
               <ResponsiveTable<OsintBreach> 
                 data={breaches} 
                 keyExtractor={b => b.email + b.breach}
                 columns={[
                    { header: 'Target Email', render: b => <span className="font-bold text-white">{b.email}</span> },
                    { header: 'Source Breach', render: b => <span className="text-red-400 font-bold uppercase">{b.breach}</span> },
                    { header: 'Data Leaked', render: b => <Badge color="slate">{b.data}</Badge> },
                 ]}
                 renderMobileCard={b => <div>{b.email}</div>}
               />
            </div>
         </Card>
      </div>
    );
  },

  SocialGraph: () => {
    // Efficient Subscription
    const profiles = useDataStore(() => threatData.getOsintSocial());
    const [analyzedProfiles, setAnalyzedProfiles] = useState<EnrichedSocial[]>([]);

    useEffect(() => {
        const analyze = async () => {
            const results = await Promise.all(profiles.map(async p => {
                const analysis = await OsintLogic.analyzeIdentity(p);
                return { ...p, ...analysis };
            }));
            setAnalyzedProfiles(results);
        };
        analyze();
    }, [profiles]);
    
    return (
      <Grid cols={3}>
         {analyzedProfiles.map(p => (
               <Card key={p.handle} className="p-4 flex flex-col gap-4 border-l-4 border-l-slate-700 hover:border-l-cyan-500 transition-colors">
                  <div className="flex justify-between items-start">
                     <div>
                        <div className="text-lg font-bold text-white">{p.handle}</div>
                        <div className="text-xs text-slate-500 uppercase">{p.platform}</div>
                     </div>
                     <Badge color={p.sentiment === 'Hostile' ? 'red' : p.sentiment === 'Negative' ? 'orange' : 'green'}>{p.sentiment}</Badge>
                  </div>
                  
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                     <p className="text-xs text-slate-300 italic">"{p.bio}"</p>
                  </div>

                  <div className="space-y-3">
                     <div>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-slate-500">Bot Probability</span>
                           <span className={`font-bold ${p.botProbability > 50 ? 'text-red-500' : 'text-green-500'}`}>{p.botProbability}%</span>
                        </div>
                        <ProgressBar value={p.botProbability} color={p.botProbability > 50 ? 'red' : 'green'} />
                     </div>
                     <div className="flex justify-between items-center text-xs bg-slate-900 p-2 rounded">
                        <span className="text-slate-500">Influence</span>
                        <span className="text-cyan-400 font-bold">{p.influence.label} ({p.influence.score})</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-800 pt-3 mt-auto">
                     <span>Followers: {p.followers}</span>
                     <span>Last Post: {p.lastPost}</span>
                  </div>
               </Card>
         ))}
      </Grid>
    );
  }
};
