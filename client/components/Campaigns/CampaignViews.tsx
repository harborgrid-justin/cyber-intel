
import React, { useMemo } from 'react';
import { Campaign, Threat, View } from '../../types';
import { Card, Badge, Grid, Button, CardHeader, ProgressBar } from '../Shared/UI';
import FeedItem from '../Feed/FeedItem';
import { threatData } from '../../services-frontend/dataLayer';
import { RiskLogic } from '../../services-frontend/logic/RiskLogic';
import CampaignImpact from './Views/CampaignImpact';

export const CampaignBriefingView: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-t-2 border-t-cyan-500 flex flex-col justify-between">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Objective</div>
                    <div className="text-white font-bold text-lg">{campaign.objective}</div>
                </Card>
                <Card className="p-4 border-t-2 border-t-cyan-500 flex flex-col justify-between">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">First Seen</div>
                    <div className="text-white font-bold font-mono text-sm">{campaign.firstSeen}</div>
                </Card>
                <Card className="p-4 border-t-2 border-t-cyan-500 flex flex-col justify-between">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Seen</div>
                    <div className="text-white font-bold font-mono text-sm">{campaign.lastSeen}</div>
                </Card>
                <Card className="p-4 border-t-2 border-t-red-500 bg-red-900/10 flex flex-col justify-between">
                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Active Threats</div>
                    <div className="text-red-500 font-bold text-lg">{campaign.threatIds.length} Indicators</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Dossier */}
                <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
                    <CardHeader title="Executive Summary" />
                    <div className="p-6 bg-slate-900/50 flex-1">
                        <p className="text-slate-300 text-sm leading-relaxed font-serif whitespace-pre-wrap">{campaign.description}</p>
                        
                        <div className="mt-6 pt-6 border-t border-slate-800">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Targeting Profile</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] text-slate-600 mb-1">Sectors</div>
                                    <div className="flex flex-wrap gap-2">{campaign.targetSectors.map(s => <Badge key={s} color="blue">{s}</Badge>)}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-600 mb-1">Regions</div>
                                    <div className="flex flex-wrap gap-2">{campaign.targetRegions.map(r => <Badge key={r} color="slate">{r}</Badge>)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Impact Side Panel - Using compact mode for correct scaling */}
                <div className="flex flex-col gap-6">
                    <CampaignImpact campaign={campaign} compact={true} />
                </div>
            </div>
        </div>
    );
};

export const CampaignTechnicalView: React.FC<{ campaign: Campaign; threats: Threat[] }> = ({ campaign, threats }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* TTP Matrix */}
        <Card className="p-0 overflow-hidden">
             <CardHeader title="MITRE ATT&CK Alignment" action={<Badge color="purple">{campaign.ttps.length} Techniques</Badge>} />
             <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-60 overflow-y-auto custom-scrollbar">
                {campaign.ttps.map(ttp => (
                   <div 
                        key={ttp} 
                        className="p-3 bg-slate-950 border border-slate-800 rounded hover:border-cyan-500 cursor-pointer group transition-colors"
                        onClick={() => window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.MITRE } }))}
                   >
                      <div className="text-xs text-cyan-500 font-mono font-bold mb-1 group-hover:text-cyan-300">{ttp}</div>
                      <div className="text-[9px] text-slate-500 uppercase">Technique</div>
                   </div>
                ))}
             </div>
        </Card>

        {/* IoC List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-3 p-0 overflow-hidden flex flex-col h-[500px]">
                <CardHeader title="Indicators of Compromise (IoCs)" action={<Button variant="secondary" className="text-[10px]">EXPORT STIX 2.1</Button>} />
                <div className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar bg-slate-900/30">
                   {threats.length > 0 ? threats.map(t => <FeedItem key={t.id} threat={t} />) : <div className="p-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">No indicators linked directly to this campaign.</div>}
                </div>
            </Card>
        </div>
    </div>
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
    <Card className="p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
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
    <Card className="p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
       <CardHeader title="Attributed Adversaries" />
       <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {actors.map(a => (
             <div key={a} className="p-4 rounded border border-slate-800 bg-slate-900/50 flex items-center gap-4 hover:border-red-500/50 transition-colors cursor-pointer group" onClick={() => handleProfile(a)}>
                <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-700 group-hover:text-white group-hover:bg-red-900 group-hover:border-red-500 transition-all">{a.substring(0,2).toUpperCase()}</div>
                <div>
                    <div className="font-bold text-white text-lg">{a}</div>
                    <div className="text-xs text-slate-500">Known Threat Group</div>
                </div>
                <Button variant="text" className="ml-auto text-cyan-500 text-xs">VIEW DOSSIER →</Button>
             </div>
          ))}
          {actors.length === 0 && <div className="text-slate-500 italic text-center col-span-2">No actors currently attributed to this campaign.</div>}
       </div>
    </Card>
  );
};
