
import React, { useMemo } from 'react';
import { Campaign, Threat, View } from '../../types';
import { Card, Badge, Grid, Button, CardHeader, ProgressBar } from '../Shared/UI';
import { MetricCard } from '../Shared/MetricCard';
import { Timeline, TimelineItem } from '../Shared/Timeline';
import FeedItem from '../Feed/FeedItem';
import { threatData } from '../../services/dataLayer';
import { RiskLogic } from '../../services/logic/RiskLogic';
import CampaignImpact from './Views/CampaignImpact';

export const CampaignBriefingView: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="Objective" value={campaign.objective} color="cyan" />
                <MetricCard title="First Seen" value={campaign.firstSeen} color="blue" />
                <MetricCard title="Last Seen" value={campaign.lastSeen} color="blue" />
                <MetricCard title="Active Threats" value={`${campaign.threatIds.length} Indicators`} color="red" />
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

                {/* Impact Side Panel */}
                <div className="flex flex-col gap-6">
                    <CampaignImpact campaign={campaign} compact={true} />
                </div>
            </div>
        </div>
    );
};

export const CampaignTechnicalView: React.FC<{ campaign: Campaign; threats: Threat[] }> = ({ campaign, threats }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

  const handleNav = (type: string, id: string) => {
      if (type === 'CASE') window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.CASES, id } }));
      if (type === 'REPORT') window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.REPORTS, id } }));
  };

  const timelineItems: TimelineItem[] = [
      { date: campaign.firstSeen, title: 'Campaign First Observed', type: 'START', id: 'start', description: 'Initial detection vector' },
      ...relatedCases.map(c => ({ date: c.created, title: `Case Opened: ${c.title}`, type: 'CASE', id: c.id, description: c.priority, onClick: () => handleNav('CASE', c.id) })),
      ...relatedReports.map(r => ({ date: r.date, title: `Report: ${r.title}`, type: 'REPORT', id: r.id, description: r.type, onClick: () => handleNav('REPORT', r.id) })),
      { date: campaign.lastSeen, title: 'Last Known Activity', type: 'END', id: 'end', description: 'Latest signal received' }
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader title="Operational Timeline" />
        <div className="p-6">
            <Timeline items={timelineItems} />
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
