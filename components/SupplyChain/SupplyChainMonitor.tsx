
import React, { useMemo, useState } from 'react';
import { Button } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { StandardPage } from '../Shared/Layouts';
import { RiskRadar } from './Views/RiskRadar';
import { SbomInspector } from './Views/SbomInspector';
import { VendorInventory } from './Views/VendorInventory';
import { SupplyChainGraph } from './Views/SupplyChainGraph';
import { AccessGovernance } from './Views/AccessGovernance';
import { ComplianceTracker } from './Views/ComplianceTracker';
import { GeopoliticalRisk } from './Views/GeopoliticalRisk';
import { View } from '../../types';

const SupplyChainMonitor: React.FC = () => {
  const modules = useMemo(() => threatData.getModulesForView(View.SUPPLY_CHAIN), []);
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  
  // Efficient Subscription
  const vendors = useDataStore(() => threatData.getVendors());
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleReassess = () => {
    setIsRefreshing(true);
    setTimeout(() => {
        threatData.reassessVendorRisk();
        setIsRefreshing(false);
    }, 1000);
  };

  // Optimization: Memoize expensive sort operation
  const riskData = useMemo(() => {
    return [...vendors].sort((a, b) => b.riskScore - a.riskScore);
  }, [vendors]);

  const selectedVendor = riskData.find(v => v.id === selectedVendorId) || riskData[0];

  return (
    <StandardPage 
        title="Third-Party Risk Operations" 
        subtitle="Supply Chain Risk Management (SCRM)" 
        modules={modules} 
        activeModule={activeModule} 
        onModuleChange={setActiveModule}
        actions={<Button onClick={handleReassess} disabled={isRefreshing} variant="secondary" className="text-[10px]">{isRefreshing ? 'CALCULATING RISK...' : 'REASSESS RISKS'}</Button>}
    >
        <div className="flex-1 min-h-0 overflow-hidden">
            {activeModule === 'Risk Radar' && <RiskRadar riskData={riskData} onSelect={setSelectedVendorId} />}
            {activeModule === 'Vendor Inventory' && <VendorInventory vendors={riskData} onSelect={setSelectedVendorId} />}
            {activeModule === 'SBOM Inspector' && <SbomInspector riskData={riskData} selectedVendor={selectedVendor} onSelect={setSelectedVendorId} />}
            {activeModule === 'N-Tier Graph' && <SupplyChainGraph vendors={riskData} />}
            {activeModule === 'Access Gov' && <AccessGovernance vendors={riskData} />}
            {activeModule === 'Compliance' && <ComplianceTracker vendors={riskData} />}
            {activeModule === 'Geopolitics' && <GeopoliticalRisk vendors={riskData} />}
            
            {activeModule === 'Incidents' && (
                <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 py-4">
                    <div className="pl-8 relative">
                        <div className="absolute left-[-9px] top-1.5 w-4 h-4 bg-slate-900 border-2 border-red-500 rounded-full"></div>
                        <div className="text-sm font-bold text-white">SolarWinds Orion Compromise</div>
                        <div className="text-xs text-slate-500">Dec 2020 • Supply Chain Attack • Global Impact</div>
                    </div>
                    <div className="pl-8 relative">
                        <div className="absolute left-[-9px] top-1.5 w-4 h-4 bg-slate-900 border-2 border-orange-500 rounded-full"></div>
                        <div className="text-sm font-bold text-white">Log4Shell Disclosure</div>
                        <div className="text-xs text-slate-500">Dec 2021 • Critical Vulnerability • Affects 40% of vendors</div>
                    </div>
                </div>
            )}
        </div>
    </StandardPage>
  );
};
export default SupplyChainMonitor;
