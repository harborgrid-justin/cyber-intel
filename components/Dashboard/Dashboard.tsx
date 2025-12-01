
import React, { useEffect, useState } from 'react';
import StatCard from './StatCard';
import ThreatChart from './ThreatChart';
import CategoryRadarChart from './CategoryRadarChart';
import SystemHealth from './SystemHealth';
import GeoMap from './GeoMap';
import { generateDailyBriefing } from '../../services/geminiService';
import { threatData } from '../../services/dataLayer';
import { StandardPage } from '../Shared/Layouts';
import { Card, Badge } from '../Shared/UI';
import { CONFIG } from '../../config';
import { View, IncidentStatus } from '../../types';

const Dashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.DASHBOARD[0]);
  const [briefing, setBriefing] = useState<string>('DECRYPTING INTELLIGENCE STREAM...');
  
  const [threats, setThreats] = useState(threatData.getThreats(false));
  const [activeCases, setActiveCases] = useState(threatData.getCases().filter(c => c.status !== 'CLOSED'));

  useEffect(() => { 
    generateDailyBriefing().then(setBriefing);
    const refreshData = () => {
      setThreats(threatData.getThreats(false));
      setActiveCases(threatData.getCases().filter(c => c.status !== 'CLOSED'));
    };
    window.addEventListener('data-update', refreshData);
    return () => window.removeEventListener('data-update', refreshData);
  }, []);

  const handleNavigate = (view: View) => {
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view } }));
  };

  const activeThreatCount = threats.filter(t => t.status !== IncidentStatus.CLOSED).length;

  const renderContent = () => {
    if(activeModule === 'Global Map') return <GeoMap />;
    if(activeModule === 'System Health') return <SystemHealth />;
    
    if (activeModule === 'Compliance') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                    <div className="text-4xl font-bold text-green-500 mb-2">98%</div>
                    <div className="text-sm font-bold text-slate-400 uppercase">GDPR Readiness</div>
                </Card>
                <Card className="p-6 text-center">
                    <div className="text-4xl font-bold text-yellow-500 mb-2">84%</div>
                    <div className="text-sm font-bold text-slate-400 uppercase">NIST Framework</div>
                </Card>
                <Card className="p-6 text-center">
                    <div className="text-4xl font-bold text-cyan-500 mb-2">100%</div>
                    <div className="text-sm font-bold text-slate-400 uppercase">ISO 27001</div>
                </Card>
                <Card className="p-6 md:col-span-3">
                   <h3 className="font-bold text-white mb-4">Pending Compliance Tasks</h3>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded"><span className="text-slate-300">Quarterly Access Review</span><Badge color="red">OVERDUE</Badge></div>
                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded"><span className="text-slate-300">Firewall Rule Audit</span><Badge color="yellow">DUE IN 2 DAYS</Badge></div>
                   </div>
                </Card>
            </div>
        );
    }

    if (activeModule === 'Insider Threat') {
        return (
            <Card className="p-6">
               <h3 className="font-bold text-white mb-4">High Risk User Behavior</h3>
               <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-slate-950 text-xs uppercase"><tr className="text-slate-500"><th>User</th><th>Risk Score</th><th>Anomalies</th><th>Action</th></tr></thead>
                  <tbody className="divide-y divide-slate-800">
                     <tr><td className="py-3 text-white font-bold">j.doe@corp.local</td><td className="py-3 text-red-500 font-bold">95</td><td className="py-3">Large Data Exfil (USB)</td><td className="py-3 text-cyan-500 cursor-pointer">INVESTIGATE</td></tr>
                     <tr><td className="py-3 text-white font-bold">sysadmin_02</td><td className="py-3 text-orange-500 font-bold">78</td><td className="py-3">Off-hours Login</td><td className="py-3 text-cyan-500 cursor-pointer">INVESTIGATE</td></tr>
                  </tbody>
               </table>
            </Card>
        );
    }
    
    if (activeModule === 'Network Ops' || activeModule === 'Cloud Security' || activeModule === 'Dark Web') {
        return <div className="p-12 text-center border border-dashed border-slate-800 rounded text-slate-500 uppercase tracking-widest">Live feed for {activeModule} establishing connection...</div>;
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard onClick={() => handleNavigate(View.FEED)} title="Active Threats" value={activeThreatCount.toString()} trend="+3" isPositive={false} color="red" />
          <StatCard onClick={() => handleNavigate(View.CASES)} title="Active Cases" value={activeCases.length.toString()} trend="2 Critical" isPositive={false} color="blue" />
          <StatCard onClick={() => handleNavigate(View.INCIDENTS)} title="Mean Time To Resolve" value="14m" trend="-2m" isPositive={true} color="green" />
          <StatCard onClick={() => handleNavigate(View.REPORTS)} title="Compliance Score" value="98%" trend="stable" isPositive={true} color="orange" />
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 border-l-2 border-l-cyan-500">
          <h3 className="text-cyan-500 font-bold mb-1 uppercase text-[10px] tracking-widest">Executive Briefing</h3>
          <p className="text-slate-300 text-sm font-mono leading-relaxed">{briefing}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <ThreatChart />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-80">
                <CategoryRadarChart />
                <GeoMap />
             </div>
          </div>
          <div className="flex flex-col gap-6"><SystemHealth /></div>
        </div>
      </div>
    );
  };

  return (
    <StandardPage 
      title="Global Situational Awareness" 
      subtitle={`System Status: ONLINE | Threat Level: ${CONFIG.APP.THREAT_LEVEL}`}
      modules={CONFIG.MODULES.DASHBOARD}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      {renderContent()}
    </StandardPage>
  );
};
export default Dashboard;
