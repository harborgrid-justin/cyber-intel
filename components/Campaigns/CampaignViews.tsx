
import React from 'react';
import { Campaign, Threat, View } from '../../types';
import { Card, Badge, Grid, Button, CardHeader } from '../Shared/UI';
import FeedItem from '../Feed/FeedItem';
import { threatData } from '../../services/dataLayer';

export const CampaignOverview: React.FC<{ campaign: Campaign }> = ({ campaign }) => (
  <div className="space-y-6">
    <Card className="p-0 border-l-4 border-l-cyan-500 overflow-hidden">
      <CardHeader title="Executive Summary" />
      <div className="p-6">
        <p className="text-slate-300 text-sm leading-relaxed">{campaign.description}</p>
      </div>
    </Card>

    <Grid cols={3}>
      <Card className="p-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Objective</div>
        <div className="text-white font-bold text-lg">{campaign.objective}</div>
      </Card>
      <Card className="p-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Timeline</div>
        <div className="text-sm text-slate-300">{campaign.firstSeen} <span className="text-slate-500 mx-2">→</span> {campaign.lastSeen}</div>
      </Card>
      <Card className="p-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Status</div>
        <Badge color={campaign.status === 'ACTIVE' ? 'red' : 'slate'}>{campaign.status}</Badge>
      </Card>
    </Grid>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-0 overflow-hidden">
         <CardHeader title="Target Sectors" />
         <div className="p-4 flex flex-wrap gap-2">
            {campaign.targetSectors.map(s => <Badge key={s} color="blue">{s}</Badge>)}
         </div>
      </Card>
      <Card className="p-0 overflow-hidden">
         <CardHeader title="Geographic Reach" />
         <div className="p-4 flex flex-wrap gap-2">
            {campaign.targetRegions.map(r => <span key={r} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 font-bold">{r}</span>)}
         </div>
      </Card>
    </div>
  </div>
);

export const CampaignIoCs: React.FC<{ threats: Threat[] }> = ({ threats }) => (
  <Card className="p-0 overflow-hidden h-full flex flex-col">
    <CardHeader title="Linked Indicators" action={<Badge color="red">{threats.length} IOCs</Badge>} />
    <div className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
       {threats.length > 0 ? threats.map(t => <FeedItem key={t.id} threat={t} />) : <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded">No indicators linked directly to this campaign.</div>}
    </div>
  </Card>
);

export const CampaignTimeline: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const relatedCases = threatData.getCases().filter(c => c.relatedThreatIds.some(tid => campaign.threatIds.includes(tid)));
  const relatedReports = threatData.getReports().filter(r => (r.relatedActorId && campaign.actors.includes(threatData.getActors().find(a => a.id === r.relatedActorId)?.name || '')) || (r.relatedCaseId && relatedCases.some(c => c.id === r.relatedCaseId)));

  const events = [
      { date: campaign.firstSeen, title: 'Campaign First Observed', type: 'START', id: 'start', desc: 'Initial detection' },
      ...relatedCases.map(c => ({ date: c.created, title: `Case Opened: ${c.title}`, type: 'CASE', id: c.id, desc: c.priority })),
      ...relatedReports.map(r => ({ date: r.date, title: `Report: ${r.title}`, type: 'REPORT', id: r.id, desc: r.type })),
      { date: campaign.lastSeen, title: 'Last Known Activity', type: 'END', id: 'end', desc: 'Latest signal' }
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleNav = (type: string, id: string) => {
      if (type === 'CASE') window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.CASES, id } }));
      if (type === 'REPORT') window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.REPORTS, id } }));
  };

  return (
    <Card className="p-0 overflow-hidden">
        <CardHeader title="Operational Timeline" />
        <div className="relative border-l-2 border-slate-800 ml-8 space-y-8 my-8 mr-8">
            {events.map((e, i) => (
                <div key={i} className="pl-8 relative group">
                    <div className={`absolute left-[-9px] top-1.5 w-4 h-4 rounded-full border-2 ${e.type === 'START' ? 'bg-slate-950 border-green-500' : e.type === 'END' ? 'bg-slate-950 border-red-500' : 'bg-slate-800 border-cyan-500'} transition-colors group-hover:bg-cyan-500`}></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-mono mb-0.5">{e.date}</span>
                        <div className={`text-sm font-bold ${['CASE','REPORT'].includes(e.type) ? 'text-cyan-400 cursor-pointer hover:underline' : 'text-white'}`} onClick={() => handleNav(e.type, e.id)}>
                            {e.title}
                        </div>
                        <div className="text-xs text-slate-400">{e.desc}</div>
                    </div>
                </div>
            ))}
        </div>
    </Card>
  );
};

export const CampaignAttribution: React.FC<{ actors: string[] }> = ({ actors }) => {
  const handleProfile = (name: string) => {
      const actor = threatData.getActors().find(a => a.name === name);
      if(actor) window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.ACTORS, id: actor.id } }));
      else alert("Actor profile not found in local database.");
  };

  return (
    <Card className="p-0 overflow-hidden">
       <CardHeader title="Attributed Adversaries" />
       <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {actors.map(a => (
             <div key={a} className="p-4 rounded border border-slate-800 bg-slate-900/50 flex items-center gap-4 hover:border-red-500/50 transition-colors cursor-pointer" onClick={() => handleProfile(a)}>
                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-700">{a.substring(0,2).toUpperCase()}</div>
                <div><div className="font-bold text-white">{a}</div><div className="text-xs text-slate-500">Threat Actor</div></div>
                <Button variant="text" className="ml-auto text-cyan-500 text-xs">PROFILE</Button>
             </div>
          ))}
       </div>
    </Card>
  );
};
