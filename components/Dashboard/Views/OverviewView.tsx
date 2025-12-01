
import React from 'react';
import { Card, Grid, ProgressBar } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { OverviewLogic } from '../../../services/logic/dashboard/CoreLogic';
import ThreatChart from '../ThreatChart';
import GeoMap from '../GeoMap';
import CategoryRadarChart from '../CategoryRadarChart';
import StatCard from '../StatCard';
import { View } from '../../../types';

interface OverviewProps { briefing: string; }

export const OverviewView: React.FC<OverviewProps> = ({ briefing }) => {
  const threats = threatData.getThreats();
  const cases = threatData.getCases();
  
  const defcon = OverviewLogic.calculateDefconLevel(threats, cases);
  const trend = OverviewLogic.getTrendMetrics(threats);

  const handleNavigate = (view: View) => {
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view } }));
  };

  return (
    <div className="space-y-6 overflow-y-auto p-1">
      {/* Top Stats */}
      <Grid cols={4}>
        <StatCard onClick={() => handleNavigate(View.FEED)} title="Threat Volume (24h)" value={trend.count.toString()} trend={`${trend.delta > 0 ? '+' : ''}${trend.delta}`} isPositive={trend.trend === 'DOWN'} color="red" />
        <StatCard onClick={() => handleNavigate(View.CASES)} title="Active Cases" value={cases.filter(c => c.status !== 'CLOSED').length.toString()} trend="Operational" color="blue" />
        <Card className="p-5 border-l-4 border-l-yellow-500 bg-slate-900 flex flex-col justify-between">
           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Defcon Status</div>
           <div className={`text-2xl font-black ${defcon.color} animate-pulse`}>{defcon.label}</div>
        </Card>
        <StatCard onClick={() => handleNavigate(View.REPORTS)} title="Intel Products" value={threatData.getReports().length.toString()} color="purple" />
      </Grid>

      {/* Briefing Banner */}
      <div className="bg-slate-900/50 border border-slate-800 p-4 border-l-2 border-l-cyan-500 rounded">
        <h3 className="text-cyan-500 font-bold mb-1 uppercase text-[10px] tracking-widest">Executive Briefing (AI Generated)</h3>
        <p className="text-slate-300 text-sm font-mono leading-relaxed">{briefing}</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
           <ThreatChart />
        </div>
        <div className="flex flex-col gap-6 h-full">
           <CategoryRadarChart />
        </div>
      </div>
      
      {/* Mini Map */}
      <div className="h-64">
         <GeoMap threats={threats} />
      </div>
    </div>
  );
};
