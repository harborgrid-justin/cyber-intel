
import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ThreatFeed from './components/Feed/ThreatFeed';
import CaseBoard from './components/Cases/CaseBoard';
import ActorLibrary from './components/Actors/ActorLibrary';
import CampaignManager from './components/Campaigns/CampaignManager';
import VulnerabilityManager from './components/Vulnerabilities/VulnerabilityManager';
import MitreBrowser from './components/Knowledge/MitreBrowser';
import OsintDashboard from './components/Osint/OsintDashboard';
import EvidencePortal from './components/Evidence/EvidencePortal';
import ReportsCenter from './components/Reports/ReportsCenter';
import SupplyChainMonitor from './components/SupplyChain/SupplyChainMonitor';
import BreachSimulator from './components/Simulation/BreachSimulator';
import Orchestrator from './components/Response/Orchestrator';
import ExecutiveProtection from './components/Osint/ExecutiveProtection';
import MessagingPlatform from './components/Messaging/MessagingPlatform';
import SystemConfig from './components/System/SystemConfig';
import AuditLogViewer from './components/Admin/AuditLogViewer';
import SettingsMain from './components/Settings/SettingsMain';
import IntelAssistant from './components/Analysis/IntelAssistant';
import IncidentManager from './components/Incidents/IncidentManager';
import DetectionScanner from './components/Detection/DetectionScanner';
import IngestionManager from './components/Ingestion/IngestionManager';
import { View } from './types';
import { ErrorBoundary } from './components/Shared/ErrorBoundary';
import { useThemeEngine } from './hooks/useThemeEngine';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [viewParams, setViewParams] = useState<any>({});
  
  // Initialize Theme Engine at root level to ensure CSS vars are injected
  useThemeEngine();

  // Global navigation handler to support deep linking from within components
  React.useEffect(() => {
    const handleNav = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        setCurrentView(detail.view);
        if (detail.id) setViewParams({ id: detail.id });
        else setViewParams({});
    };
    window.addEventListener('app-navigation', handleNav);
    return () => window.removeEventListener('app-navigation', handleNav);
  }, []);

  const renderView = () => {
    switch(currentView) {
        case View.DASHBOARD: return <Dashboard />;
        case View.FEED: return <ThreatFeed />;
        case View.CASES: return <CaseBoard initialId={viewParams.id} />;
        case View.ACTORS: return <ActorLibrary initialId={viewParams.id} />;
        case View.CAMPAIGNS: return <CampaignManager initialId={viewParams.id} />;
        case View.VULNERABILITIES: return <VulnerabilityManager />;
        case View.MITRE: return <MitreBrowser />;
        case View.OSINT: return <OsintDashboard />;
        case View.EVIDENCE: return <EvidencePortal />;
        case View.REPORTS: return <ReportsCenter initialId={viewParams.id} />;
        case View.SUPPLY_CHAIN: return <SupplyChainMonitor />;
        case View.SIMULATION: return <BreachSimulator />;
        case View.ORCHESTRATOR: return <Orchestrator />;
        case View.VIP_PROTECTION: return <ExecutiveProtection />;
        case View.MESSAGING: return <MessagingPlatform />;
        case View.SYSTEM: return <SystemConfig />;
        case View.AUDIT: return <AuditLogViewer />;
        case View.SETTINGS: return <SettingsMain />;
        case View.ANALYSIS: return <IntelAssistant />;
        case View.INCIDENTS: return <IncidentManager />;
        case View.DETECTION: return <DetectionScanner />;
        case View.INGESTION: return <IngestionManager />;
        case View.THEME: return <SystemConfig />; // Theme is part of system
        default: return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <Layout currentView={currentView} onNavigate={setCurrentView}>
          {renderView()}
      </Layout>
    </ErrorBoundary>
  );
};

export default App;
