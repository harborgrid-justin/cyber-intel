

import React, { useState, useEffect, Suspense, lazy } from 'react';
import Layout from './components/Layout/Layout';
import { ErrorBoundary } from './components/Shared/ErrorBoundary';
import { View } from './types';
import { threatData } from './services/dataLayer';
import { Icons } from './components/Shared/Icons';
import { useThemeEngine } from './hooks';
import { bus, EVENTS } from './services/eventBus';
import { StandardPage } from './components/Shared/Layouts';

// Lazy Load Modules (Code Splitting)
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const ThreatFeed = lazy(() => import('./components/Feed/ThreatFeed'));
const IntelAssistant = lazy(() => import('./components/Analysis/IntelAssistant'));
const IngestionManager = lazy(() => import('./components/Ingestion/IngestionManager'));
const DetectionScanner = lazy(() => import('./components/Detection/DetectionScanner'));
const IncidentManager = lazy(() => import('./components/Incidents/IncidentManager'));
const AuditLogViewer = lazy(() => import('./components/Admin/AuditLogViewer'));
const CaseBoard = lazy(() => import('./components/Cases/CaseBoard'));
const ActorLibrary = lazy(() => import('./components/Actors/ActorLibrary'));
const VulnerabilityManager = lazy(() => import('./components/Vulnerabilities/VulnerabilityManager'));
const MitreBrowser = lazy(() => import('./components/Knowledge/MitreBrowser'));
const OsintDashboard = lazy(() => import('./components/Osint/OsintDashboard'));
const EvidencePortal = lazy(() => import('./components/Evidence/EvidencePortal'));
const ReportsCenter = lazy(() => import('./components/Reports/ReportsCenter'));
const SystemConfig = lazy(() => import('./components/System/SystemConfig'));
const CampaignManager = lazy(() => import('./components/Campaigns/CampaignManager'));
const SupplyChainMonitor = lazy(() => import('./components/SupplyChain/SupplyChainMonitor'));
const BreachSimulator = lazy(() => import('./components/Simulation/BreachSimulator'));
const Orchestrator = lazy(() => import('./components/Response/Orchestrator'));
const ExecutiveProtection = lazy(() => import('./components/Osint/ExecutiveProtection'));
const MessagingPlatform = lazy(() => import('./components/Messaging/MessagingPlatform'));
const SettingsMain = lazy(() => import('./components/Settings/SettingsMain'));
// Theme Editor as named export
const ThemeEditor = lazy(() => import('./components/System/Views/ThemeEditor').then(module => ({ default: module.ThemeEditor })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full bg-[var(--colors-appBg)] text-[var(--colors-primary)] animate-pulse">
    <Icons.Activity className="w-8 h-8 mr-2" />
    <span className="font-mono text-sm tracking-widest">LOADING MODULE...</span>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [viewParams, setViewParams] = useState<{ id?: string }>({});
  const [isOffline, setIsOffline] = useState(false);
  
  useThemeEngine();

  useEffect(() => {
    // Strategic Prefetching based on common workflow
    if (currentView === View.DASHBOARD) {
        // High probability next action
        const preloadFeed = import('./components/Feed/ThreatFeed');
    }

    const handleNavigation = (e: Event) => {
      const { view, ...params } = (e as CustomEvent).detail;
      setCurrentView(view);
      setViewParams(params);
      threatData.syncManager.prefetch(view);
    };
    const handleAdapterChange = () => setIsOffline(threatData.getAdapterInfo().type !== 'REMOTE');
    
    handleAdapterChange();
    window.addEventListener('app-navigation', handleNavigation);
    window.addEventListener('db-adapter-changed', handleAdapterChange);
    
    return () => {
      window.removeEventListener('app-navigation', handleNavigation);
      window.removeEventListener('db-adapter-changed', handleAdapterChange);
    };
  }, [currentView]);

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD: return <Dashboard />;
      case View.FEED: return <ThreatFeed />;
      case View.ANALYSIS: return <IntelAssistant />;
      case View.INGESTION: return <IngestionManager />;
      case View.DETECTION: return <DetectionScanner />;
      case View.INCIDENTS: return <IncidentManager />;
      case View.CASES: return <CaseBoard initialId={viewParams.id} />;
      case View.ACTORS: return <ActorLibrary initialId={viewParams.id} />;
      case View.AUDIT: return <AuditLogViewer />;
      case View.VULNERABILITIES: return <VulnerabilityManager />;
      case View.MITRE: return <MitreBrowser />;
      case View.OSINT: return <OsintDashboard />;
      case View.EVIDENCE: return <EvidencePortal />;
      case View.SYSTEM: return <SystemConfig />;
      case View.REPORTS: return <ReportsCenter initialId={viewParams.id} />;
      case View.CAMPAIGNS: return <CampaignManager initialId={viewParams.id} />;
      case View.SUPPLY_CHAIN: return <SupplyChainMonitor />;
      case View.SIMULATION: return <BreachSimulator />;
      case View.ORCHESTRATOR: return <Orchestrator />;
      case View.VIP_PROTECTION: return <ExecutiveProtection />;
      case View.MESSAGING: return <MessagingPlatform />;
      case View.SETTINGS: return <SettingsMain />;
      case View.THEME: return (
        <StandardPage title="Design System & Theme Engine" subtitle="Live CSS Variable Customization" modules={[]} activeModule="" onModuleChange={() => {}}>
          <ThemeEditor />
        </StandardPage>
      );
      default: return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <Layout currentView={currentView} onNavigate={setCurrentView}>
        {isOffline && <div className="bg-[var(--colors-warningDim)] border-b border-[var(--colors-warning)]/50 text-[var(--colors-warning)] text-[10px] py-1 px-4 text-center font-mono font-bold">⚠ OFFLINE MODE: USING LOCAL CACHE & SIMULATION LOGIC.</div>}
        <Suspense fallback={<LoadingFallback />}>{renderContent()}</Suspense>
      </Layout>
    </ErrorBoundary>
  );
};
export default App;
