
import React, { useState } from 'react';
import { Badge, Card, Button, Grid } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import { threatData } from '../../services/dataLayer';

const MitreBrowser: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.MITRE[0]);
  const tactics = threatData.getMitreTactics();
  const techniques = threatData.getMitreTechniques();
  const subTechs = threatData.getMitreSubTechniques();
  const groups = threatData.getMitreGroups();
  const software = threatData.getMitreSoftware();
  const mitigations = threatData.getMitreMitigations();

  const handleLink = (url?: string) => { if(url) alert(`Navigating: ${url}`); };
  const handleView = (id: string, type: string) => alert(`Viewing KB entry for ${type} ID: ${id}`);
  const handleSync = () => alert('Synchronizing with MITRE TAXII Server... Updated 14 items.');

  return (
    <StandardPage title="MITRE ATT&CK Knowledge Base" subtitle="Framework Version: v13.1" actions={<Button onClick={handleSync} variant="secondary">SYNC FRAMEWORK</Button>} modules={CONFIG.MODULES.MITRE} activeModule={activeModule} onModuleChange={setActiveModule}>
      {activeModule === 'Enterprise Matrix' && (
        <div className="overflow-x-auto pb-4 custom-scrollbar"><div className="flex gap-4 min-w-[1400px]">{tactics.map(tactic => (
           <div key={tactic.id} className="flex-1 min-w-[160px] flex flex-col gap-2">
              <div className="bg-slate-800 p-2 text-center border-b-2 border-cyan-600 rounded-t"><div className="text-xs font-bold text-white uppercase">{tactic.name}</div><div className="text-[10px] text-slate-500">{tactic.id}</div></div>
              {techniques.filter(t => t.tactic === tactic.name).map(tech => (
                <div key={tech.id} onClick={() => handleView(tech.id, 'Technique')} className="bg-slate-900 border border-slate-700 p-2 text-[10px] text-slate-300 hover:bg-cyan-900/20 hover:border-cyan-500 cursor-pointer transition-colors rounded relative group">
                   <span className="font-bold block text-slate-400 group-hover:text-cyan-400">{tech.id}</span>{tech.name}<div className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-0 group-hover:opacity-100"></div>
                </div>
              ))}
           </div>
        ))}</div></div>
      )}

      {activeModule === 'Tactics' && (
        <Grid cols={2}>{tactics.map(t => (
             <Card key={t.id} className="p-4 border-l-4 border-l-cyan-500 flex flex-col justify-between">
                <div><div className="flex justify-between mb-2"><h3 className="font-bold text-white text-lg">{t.name}</h3><span className="font-mono text-xs text-cyan-500 bg-cyan-900/20 px-2 py-1 rounded">{t.id}</span></div><p className="text-sm text-slate-400">{t.description}</p></div>
                <div className="mt-4 flex gap-2"><Button onClick={() => handleView(t.id, 'Tactic')} variant="secondary" className="w-full text-xs">VIEW TECHNIQUES</Button></div>
             </Card>
        ))}</Grid>
      )}

      {activeModule === 'Techniques' && (
        <Grid cols={3}>{techniques.map(t => (
            <Card key={t.id} className="p-4 hover:border-cyan-500 transition-colors cursor-pointer group flex flex-col h-full">
               <div className="flex justify-between items-start mb-2"><span className="text-xs font-bold font-mono text-cyan-500 group-hover:text-cyan-300">{t.id}</span><Badge color="slate">{t.tactic}</Badge></div>
               <h3 className="text-white font-bold mb-2 text-lg">{t.name}</h3><p className="text-xs text-slate-400 leading-relaxed flex-1">{t.description}</p>
               <div className="mt-4 flex gap-2 pt-2 border-t border-slate-800"><Button onClick={() => handleView(t.id, 'Technique')} variant="text" className="flex-1 text-xs">DETAILS</Button><Button onClick={() => handleLink(t.url)} variant="outline" className="flex-1 text-xs">MITRE DB ↗</Button></div>
            </Card>
        ))}</Grid>
      )}

      {activeModule === 'Sub-Techniques' && (
        <ResponsiveTable data={subTechs} keyExtractor={s => s.id}
          columns={[{ header: 'ID', render: s => <span className="text-cyan-400 font-mono font-bold">{s.id}</span> }, { header: 'Name', render: s => <span className="text-white font-bold">{s.name}</span> }, { header: 'Parent', render: s => <Badge color="slate">{s.parent}</Badge> }, { header: 'Desc', render: s => <span className="text-slate-400 text-xs">{s.description}</span> }, { header: 'Act', render: s => <Button onClick={() => handleView(s.id, 'Sub')} variant="text" className="text-xs">VIEW</Button> }]}
          renderMobileCard={s => <div>{s.name}</div>}
        />
      )}

      {activeModule === 'APT Groups' && (
        <ResponsiveTable data={groups} keyExtractor={g => g.id}
           columns={[{ header: 'ID', render: g => <span className="font-mono text-cyan-500">{g.id}</span> }, { header: 'Name', render: g => <span className="text-white font-bold">{g.name}</span> }, { header: 'Aliases', render: g => <div className="flex gap-1 flex-wrap">{g.aliases?.map(a => <Badge key={a} color="slate">{a}</Badge>)}</div> }, { header: 'Desc', render: g => <span className="text-xs text-slate-400 line-clamp-2">{g.description}</span> }, { header: 'Profile', render: g => <Button onClick={() => handleView(g.id, 'Group')} variant="outline" className="text-[10px]">OPEN PROFILE</Button> }]}
           renderMobileCard={g => <div>{g.name}</div>}
        />
      )}

      {activeModule === 'Software' && (
        <Grid cols={3}>{software.map(s => (
             <Card key={s.id} className="p-4 border-l-4 border-l-purple-500 flex flex-col justify-between group hover:bg-slate-900/80 cursor-pointer">
                <div><div className="flex justify-between mb-2"><h3 className="font-bold text-white group-hover:text-purple-400">{s.name}</h3><Badge color="purple">{s.type}</Badge></div><p className="text-xs text-slate-400 mb-2">{s.description}</p><div className="text-[10px] font-mono text-slate-500 bg-slate-950 p-1 rounded inline-block">{s.id}</div></div>
                <Button onClick={() => handleView(s.id, 'Software')} className="mt-3 w-full" variant="secondary">ANALYSIS REPORT</Button>
             </Card>
        ))}</Grid>
      )}

      {activeModule === 'Mitigations' && (
         <Grid cols={2}>{mitigations.map(m => (
              <Card key={m.id} className="p-4 flex gap-4 items-start hover:border-green-500/50 transition-colors">
                 <div className="bg-green-900/20 text-green-500 p-2 rounded text-xs font-bold font-mono h-fit">{m.id}</div>
                 <div className="flex-1"><h4 className="text-white font-bold text-sm mb-1">{m.name}</h4><p className="text-sm text-slate-400 mb-3">{m.description}</p><div className="flex gap-2"><Button onClick={() => handleView(m.id, 'Mitigation')} variant="outline" className="text-[10px] py-1">IMPLEMENTATION GUIDE</Button></div></div>
              </Card>
         ))}</Grid>
      )}
    </StandardPage>
  );
};
export default MitreBrowser;
