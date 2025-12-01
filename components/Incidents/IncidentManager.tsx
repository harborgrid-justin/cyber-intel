
import React, { useEffect, useState } from 'react';
import { threatData } from '../../services/dataLayer';
import IncidentTriage from './IncidentTriage';
import IncidentKanban from './IncidentKanban';
import WarRoom from './WarRoom';
import { IncidentTimeline, IncidentAssets, IncidentReports, IncidentUsers, IncidentPlaybooks, IncidentEvidence, IncidentNetwork } from './IncidentViews';
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
        {activeModule === 'Network' && <IncidentNetwork threats={threats} />}
      </div>
    </StandardPage>
  );
};
export default IncidentManager;
