
import React, { useMemo, useState, useEffect } from 'react';
import { FilterGroup, Button } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { threatData } from '../../services/dataLayer';
import { StandardPage } from '../Shared/Layouts';
import { RiskRadar } from './Views/RiskRadar';
import { SbomInspector } from './Views/SbomInspector';
import { VendorInventory } from './Views/VendorInventory';
import { SupplyChainGraph } from './Views/SupplyChainGraph';
import { AccessGovernance } from './Views/AccessGovernance';
import { ComplianceTracker } from './Views/ComplianceTracker';
import { GeopoliticalRisk } from './Views/GeopoliticalRisk';
import { Vendor } from '../../types';

const SupplyChainMonitor: React.FC = () => {
  const [activeModule, setActiveModule] = useState('RISK_RADAR');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>(threatData.getVendors());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const refresh = () => setVendors(threatData.getVendors());
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const handleReassess = () => {
    setIsRefreshing(true);
    setTimeout(() => {
        threatData.reassessVendorRisk();
        setIsRefreshing(false);
    }, 1000);
  };

  // Sort vendors by risk for the main view
  const riskData = useMemo(() => {
    return [...vendors].sort((a, b) => b.riskScore - a.riskScore);
  }, [vendors]);

  const selectedVendor = riskData.find(v => v.id === selectedVendorId) || riskData[0];

  const MODULES = [
    { label: 'Risk Radar', value: 'RISK_RADAR', icon: <Icons.Activity className="w-3 h-3" /> },
    { label: 'Vendor Inventory', value: 'INVENTORY', icon: <Icons.Users className="w-3 h-3" /> },
    { label: 'SBOM Inspector', value: 'SBOM', icon: <Icons.FileText className="w-3 h-3" /> },
    { label: 'N-Tier Graph', value: 'GRAPH', icon: <Icons.Layers className="w-3 h-3" /> },
    { label: 'Access Gov', value: 'ACCESS', icon: <Icons.Key className="w-3 h-3" /> },
    { label: 'Compliance', value: 'COMPLIANCE', icon: <Icons.CheckCircle className="w-3 h-3" /> },
    { label: 'Geopolitics', value: 'GEO', icon: <Icons.Globe className="w-3 h-3" /> },
    { label: 'Incidents', value: 'INCIDENTS', icon: <Icons.AlertTriangle className="w-3 h-3" /> },
  ];

  return (
    <StandardPage 
        title="Third-Party Risk Operations" 
        subtitle="Supply Chain Risk Management (SCRM)" 
        modules={[]} 
        activeModule="" 
        onModuleChange={() => {}}
        actions={<Button onClick={handleReassess} disabled={isRefreshing} variant="secondary" className="text-[10px]">{isRefreshing ? 'CALCULATING RISK...' : 'REASSESS RISKS'}</Button>}
    >
      <div className="flex flex-col gap-6 h-full">
        <div className="bg-slate-900 border-b border-slate-800 pb-0 shrink-0">
           <FilterGroup value={activeModule} onChange={setActiveModule} options={MODULES} />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
            {activeModule === 'RISK_RADAR' && <RiskRadar riskData={riskData} onSelect={setSelectedVendorId} />}
            {activeModule === 'INVENTORY' && <VendorInventory vendors={riskData} onSelect={setSelectedVendorId} />}
            {activeModule === 'SBOM' && <SbomInspector riskData={riskData} selectedVendor={selectedVendor} onSelect={setSelectedVendorId} />}
            {activeModule === 'GRAPH' && <SupplyChainGraph vendors={riskData} />}
            {activeModule === 'ACCESS' && <AccessGovernance vendors={riskData} />}
            {activeModule === 'COMPLIANCE' && <ComplianceTracker vendors={riskData} />}
            {activeModule === 'GEO' && <GeopoliticalRisk vendors={riskData} />}
            
            {activeModule === 'INCIDENTS' && (
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
      </div>
    </StandardPage>
  );
};
export default SupplyChainMonitor;
