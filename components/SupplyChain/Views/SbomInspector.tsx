
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Badge, Button } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { Vendor } from '../../../types';
import { SupplyChainLogic } from '../../../services/logic/SupplyChainLogic';

interface Props {
  riskData: Vendor[];
  selectedVendor: Vendor;
  onSelect: (id: string) => void;
}

export const SbomInspector: React.FC<Props> = ({ riskData, selectedVendor, onSelect }) => {
  const [health, setHealth] = useState({ riskScore: 0, summary: 'Analyzing...' });

  useEffect(() => {
    const analyze = async () => {
      if (selectedVendor && selectedVendor.sbom) {
        setHealth({ riskScore: 0, summary: 'Analyzing...' });
        const res = await SupplyChainLogic.analyzeSbomHealth(selectedVendor.sbom);
        setHealth(res);
      }
    };
    analyze();
  }, [selectedVendor]);

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
        <div className="w-full md:w-64 space-y-2 shrink-0 overflow-y-auto max-h-[300px] md:max-h-full">
            {riskData.map(v => (
            <div key={v.id} onClick={() => onSelect(v.id)} className={`p-3 rounded cursor-pointer border transition-all ${selectedVendor.id === v.id ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'}`}>
                <div className="font-bold text-sm truncate">{v.name}</div>
                <div className="text-[10px] uppercase flex justify-between mt-1">
                    <span>{v.product}</span>
                    <span className={v.sbom.length === 0 ? 'text-red-500' : 'text-slate-500'}>{v.sbom.length} Libs</span>
                </div>
            </div>
            ))}
        </div>
        
        <Card className="flex-1 p-0 overflow-hidden flex flex-col h-full border-t-4 border-t-cyan-500">
            <CardHeader 
                title={`Software Bill of Materials: ${selectedVendor.product}`} 
                action={<Badge color={health.riskScore > 50 ? 'red' : 'green'}>{health.summary}</Badge>}
            />
            <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <div className="flex gap-4">
                    <span>Total Components: <strong className="text-white">{selectedVendor.sbom.length}</strong></span>
                    <span>License Risk: <strong className={selectedVendor.sbom.some(c => c.license.includes('GPL')) ? 'text-orange-500' : 'text-green-500'}>{selectedVendor.sbom.some(c => c.license.includes('GPL')) ? 'HIGH' : 'LOW'}</strong></span>
                </div>
                <Button variant="secondary" className="text-[10px] h-6 px-2">EXPORT CYCLONEDX</Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {selectedVendor.sbom.length > 0 ? selectedVendor.sbom.map((comp, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded hover:border-slate-600 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-500 group-hover:text-cyan-500 transition-colors">
                            <Icons.Box className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-sm font-mono text-cyan-400 font-bold">{comp.name}</div>
                            <div className="text-[10px] text-slate-500 flex gap-2">
                                <span>v{comp.version}</span>
                                <span>•</span>
                                <span className={comp.license === 'Apache-2.0' ? 'text-green-600' : 'text-orange-500'}>{comp.license}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {comp.vulnerabilities > 0 && <span className="text-[10px] text-orange-400 font-bold">{comp.vulnerabilities} Vulns</span>}
                        {comp.critical ? (
                            <Badge color="red" className="animate-pulse">CRITICAL</Badge>
                        ) : (
                            <Badge color="green">SECURE</Badge>
                        )}
                    </div>
                </div>
            )) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 opacity-50">
                    <Icons.FileText className="w-12 h-12" />
                    <div className="text-sm">No SBOM data ingested for this vendor.</div>
                    <div className="text-xs">Upload CycloneDX or SPDX file to analyze.</div>
                </div>
            )}
            </div>
        </Card>
    </div>
  );
};
