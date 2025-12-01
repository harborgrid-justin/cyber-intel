
import React, { useState } from 'react';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import { Card, FilterGroup } from '../Shared/UI';
import { RuleViews } from './Views/RuleViews';
import { ForensicViews } from './Views/ForensicViews';
import { AdvancedViews } from './Views/AdvancedViews';
import { Icons } from '../Shared/Icons';

const DetectionScanner: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.DETECTION[0]);

  const renderContent = () => {
    switch (activeModule) {
      // Rule Development
      case 'Log Analysis': return <RuleViews.LogAnalysis />;
      case 'YARA': return <RuleViews.YaraEditor />;
      case 'Sigma': return <RuleViews.SigmaBuilder />;
      
      // Forensics
      case 'Network': return <ForensicViews.Network />;
      case 'Memory': return <ForensicViews.Memory />;
      case 'Disk': return <ForensicViews.Disk />;
      
      // Advanced / Behavior
      case 'User Behavior': return <AdvancedViews.Ueba />;
      case 'Anomaly': return <AdvancedViews.Anomaly />;
      case 'Decryption': return <AdvancedViews.Decryption />;
      
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
      modules={CONFIG.MODULES.DETECTION} 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
    >
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderContent()}
      </div>
    </StandardPage>
  );
};
export default DetectionScanner;
