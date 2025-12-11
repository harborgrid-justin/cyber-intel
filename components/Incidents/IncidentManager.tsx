
import React from 'react';
import { useIncidentManager } from '../../hooks/modules/useIncidentManager';
import { StandardPage } from '../Shared/Layouts';
import { Card } from '../Shared/UI';
import { LoadingSpinner } from '../Shared/LoadingSpinner';

// Lazy load views for better performance
const IncidentTriage = React.lazy(() => import('./IncidentTriage'));
const IncidentKanban = React.lazy(() => import('./IncidentKanban'));
const WarRoom = React.lazy(() => import('./WarRoom'));
const IncidentTimeline = React.lazy(() => import('./views/IncidentTimeline'));
const IncidentAssets = React.lazy(() => import('./views/IncidentAssets'));
const IncidentReports = React.lazy(() => import('./views/IncidentReports'));
const IncidentUsers = React.lazy(() => import('./views/IncidentUsers'));
const IncidentPlaybooks = React.lazy(() => import('./views/IncidentPlaybooks'));
const IncidentEvidence = React.lazy(() => import('./views/IncidentEvidence'));
const IncidentNetwork = React.lazy(() => import('./views/IncidentNetwork'));

const IncidentManager: React.FC = () => {
  const { 
    modules, 
    activeModule, 
    setActiveModule, 
    threats, 
    cases, 
    refresh,
    error 
  } = useIncidentManager();

  const renderContent = () => {
    switch (activeModule) {
      case 'Triage': return <IncidentTriage threats={threats} onUpdate={refresh} />;
      case 'Kanban': return <IncidentKanban threats={threats} onUpdate={refresh} />;
      case 'War Room': return <WarRoom threats={threats} cases={cases} onUpdate={refresh} />;
      case 'Timeline': return <IncidentTimeline cases={cases} />;
      case 'Assets': return <IncidentAssets />;
      case 'Users': return <IncidentUsers cases={cases} />;
      case 'Reports': return <IncidentReports />;
      case 'Playbooks': return <IncidentPlaybooks />;
      case 'Evidence': return <IncidentEvidence cases={cases} />;
      case 'Network': return <IncidentNetwork threats={threats} />;
      default: return <IncidentKanban threats={threats} onUpdate={refresh} />;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 flex-col gap-4">
        <h2 className="text-xl font-bold">Failed to load Incident Operations</h2>
        <p className="text-sm text-slate-400">{error.message}</p>
        <button onClick={refresh} className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 text-white transition-colors">Retry Connection</button>
      </div>
    );
  }

  return (
    <StandardPage
      title="Incident Response"
      subtitle={`LIVE OPS: ${threats.length} THREATS / ${cases.length} CASES`}
      modules={modules}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      <div className="flex-1 overflow-y-auto mt-2 min-h-0">
        <React.Suspense fallback={<div className="h-full flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
            {renderContent()}
        </React.Suspense>
      </div>
    </StandardPage>
  );
};
export default IncidentManager;
