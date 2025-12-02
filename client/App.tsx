
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ThreatFeed from './components/Feed/ThreatFeed';
import IntelAssistant from './components/Analysis/IntelAssistant';
import IngestionManager from './components/Ingestion/IngestionManager';
import DetectionScanner from './components/Detection/DetectionScanner';
import IncidentManager from './components/Incidents/IncidentManager';
import AuditLogViewer from './components/Admin/AuditLogViewer';
import CaseBoard from './components/Cases/CaseBoard';
import ActorLibrary from './components/Actors/ActorLibrary';
import VulnerabilityManager from './components/Vulnerabilities/VulnerabilityManager';
import MitreBrowser from './components/Knowledge/MitreBrowser';
import OsintDashboard from './components/Osint/OsintDashboard';
import EvidencePortal from './components/Evidence/EvidencePortal';
import ReportsCenter from './components/Reports/ReportsCenter';
import SystemConfig from './components/System/SystemConfig';
import CampaignManager from './components/Campaigns/CampaignManager';
import SupplyChainMonitor from './components/SupplyChain/SupplyChainMonitor';
import BreachSimulator from './components/Simulation/BreachSimulator';
import Orchestrator from './components/Response/Orchestrator';
import ExecutiveProtection from './components/Osint/ExecutiveProtection';
import MessagingPlatform from './components/Messaging/MessagingPlatform';
import { View } from './types';
import { threatData } from 'services-frontend/dataLayer';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [viewParams, setViewParams] = useState<{ id?: string }>({});
  const [backendConnected, setBackendConnected] = useState(false);

  // 🟢 AGENT-2: Initialize backend connection on app mount
  useEffect(() => {
    const initBackend = async () => {
      const useMock = import.meta.env.VITE_ENABLE_MOCK === 'true';
      
      if (!useMock) {
        console.log('🔌 Connecting to backend API...');
        const connected = await threatData.useHttpAdapter({
          host: import.meta.env.VITE_API_URL?.replace(/:\d+$/, '') || 'http://localhost',
          port: parseInt(import.meta.env.VITE_API_URL?.match(/:(\d+)$/)?.[1] || '3001'),
        });
        
        if (connected) {
          console.log('✅ Backend connected - fetching initial data...');
          setBackendConnected(true);
          
          // Fetch initial data for all stores
          await Promise.all([
            threatData.threatStore.fetch(),
            threatData.caseStore.fetch(),
            threatData.actorStore.fetch(),
            threatData.campaignStore.fetch(),
            threatData.vulnStore.fetch(),
            threatData.nodeStore.fetch(),
            threatData.userStore.fetch(),
          ]).catch(err => console.error('Error fetching initial data:', err));
          
          console.log('✅ Initial data loaded from backend');
        } else {
          console.warn('⚠️  Backend connection failed - using mock data');
          threatData.useMockAdapter();
        }
      } else {
        console.log('🎭 Using mock data (VITE_ENABLE_MOCK=true)');
        threatData.useMockAdapter();
      }
    };
    
    initBackend();
  }, []);

  useEffect(() => {
    // Intelligent Pre-fetching when view changes
    threatData.syncManager.prefetch(currentView);

    const handleNavigation = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { view, ...params } = customEvent.detail;
        setCurrentView(view);
        setViewParams(params);
        // Pre-fetch immediately on event
        threatData.syncManager.prefetch(view);
      }
    };

    window.addEventListener('app-navigation', handleNavigation);
    return () => window.removeEventListener('app-navigation', handleNavigation);
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
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};
export default App;
