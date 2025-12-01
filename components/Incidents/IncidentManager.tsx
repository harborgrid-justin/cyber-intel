
import React, { useEffect, useState } from 'react';
import { threatData } from '../../services/dataLayer';
import NetworkGraph from '../Shared/NetworkGraph';
import IncidentTriage from './IncidentTriage';
import IncidentKanban from './IncidentKanban';
import WarRoom from './WarRoom';
import { IncidentTimeline, IncidentAssets, IncidentReports, IncidentUsers, IncidentPlaybooks, IncidentEvidence } from './IncidentViews';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';

const IncidentManager: React.FC = () => {
  const [activeModule, setActiveModule] = useState('Kanban');
  const [threats, setThreats] = useState(threatData.getThreats());
  const [cases, setCases] = useState(threatData.getCases());

  const refresh = () => {
    setThreats(threatData.getThreats());
    setCases(threatData.getCases());
  };
  
  useEffect(() => {
    refresh();
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, [activeModule]);

  return (
    <StandardPage
      title="Incident Response"
      subtitle={`LIVE OPS: ${threats.length} THREATS / ${cases.length} CASES`}
      modules={CONFIG.MODULES.INCIDENTS}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      <div className="flex-1 overflow-y-auto mt-2">
        {activeModule === 'Triage' && <IncidentTriage threats={threats} onUpdate={refresh} />}
        {activeModule === 'Kanban' && <IncidentKanban threats={threats} onUpdate={refresh} />}
        {activeModule === 'War Room' && <WarRoom threats={threats} cases={cases} onUpdate={refresh} />}
        {activeModule === 'Timeline' && <IncidentTimeline cases={cases} />}
        {activeModule === 'Assets' && <IncidentAssets />}
        {activeModule === 'Users' && <IncidentUsers cases={cases} />}
        {activeModule === 'Reports' && <IncidentReports />}
        {activeModule === 'Playbooks' && <IncidentPlaybooks />}
        {activeModule === 'Evidence' && <IncidentEvidence cases={cases} />}
        {activeModule === 'Network' && (
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[500px] flex items-center justify-center">
             <div className="w-full max-w-4xl"><NetworkGraph threats={threats} /></div>
           </div>
        )}
      </div>
    </StandardPage>
  );
};
export default IncidentManager;
