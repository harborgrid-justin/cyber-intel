
import React, { useState, useMemo, lazy, Suspense } from 'react';
import { StandardPage } from '../Shared/Layouts';
import { Card } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { threatData } from '../../services/dataLayer';
import { View } from '../../types';
import { LoadingSpinner } from '../Shared/LoadingSpinner';

const LogAnalysis = lazy(() => import('./Views/LogAnalysis').then(m => ({ default: m.LogAnalysis })));
const YaraEditor = lazy(() => import('./Views/YaraEditor').then(m => ({ default: m.YaraEditor })));
const SigmaBuilder = lazy(() => import('./Views/SigmaBuilder').then(m => ({ default: m.SigmaBuilder })));
const NetworkForensics = lazy(() => import('./Views/NetworkForensics').then(m => ({ default: m.NetworkForensics })));
const MemoryForensics = lazy(() => import('./Views/MemoryForensics').then(m => ({ default: m.MemoryForensics })));
const DiskForensics = lazy(() => import('./Views/DiskForensics').then(m => ({ default: m.DiskForensics })));
const UserBehavior = lazy(() => import('./Views/UserBehavior').then(m => ({ default: m.UserBehavior })));
const AnomalyDetection = lazy(() => import('./Views/AnomalyDetection').then(m => ({ default: m.AnomalyDetection })));
const DecryptionTool = lazy(() => import('./Views/DecryptionTool').then(m => ({ default: m.DecryptionTool })));


const DetectionScanner: React.FC = () => {
  const modules = useMemo(() => threatData.getModulesForView(View.DETECTION), []);
  const [activeModule, setActiveModule] = useState(modules[0]);

  const renderContent = () => {
    switch (activeModule) {
      // Rule Development
      case 'Log Analysis': return <LogAnalysis />;
      case 'YARA': return <YaraEditor />;
      case 'Sigma': return <SigmaBuilder />;
      
      // Forensics
      case 'Network': return <NetworkForensics />;
      case 'Memory': return <MemoryForensics />;
      case 'Disk': return <DiskForensics />;
      
      // Advanced / Behavior
      case 'User Behavior': return <UserBehavior />;
      case 'Anomaly': return <AnomalyDetection />;
      case 'Decryption': return <DecryptionTool />;
      
      // Default / Legacy
      case 'Scanner': 
      default: return (
        <Card className="p-12 flex flex-col items-center justify-center text-slate-500 border-dashed">
           <Icons.Monitor className="w-16 h-16 mb-4 opacity-20" />
           <div className="text-lg font-bold">Standard Scanner</div>
           <p className="text-xs">Select a specialized module from the navigation bar.</p>
        </Card>
      );
    }
  };

  return (
    <StandardPage 
      title="Detection Engineering Lab" 
      subtitle="Advanced Threat Hunting & Forensic Analysis"
      modules={modules} 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
    >
      <div className="flex-1 min-h-0 overflow-hidden">
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><LoadingSpinner /></div>}>
            {renderContent()}
        </Suspense>
      </div>
    </StandardPage>
  );
};
export default DetectionScanner;
