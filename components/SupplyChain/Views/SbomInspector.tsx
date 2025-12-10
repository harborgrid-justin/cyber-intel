
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Badge } from '../../Shared/UI';
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
    <div className="flex h-full gap-6">
        <div className="w-64 space-y-2 shrink-0">
            {riskData.map(v => (
            <div key={v.id} onClick={() => onSelect(v.id)} className={`p-3 rounded cursor-pointer border ${selectedVendor.id === v.id ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>
                <div className="font-bold text-sm">{v.name}</div>
                <div className="text-[10px] uppercase">{v.product}</div>
            </div>
            ))}
        </div>
        <Card className="flex-1 p-0 overflow-hidden flex flex-col">
            <CardHeader 
                title={`Software Bill of Materials: ${selectedVendor.product}`} 
                action={<Badge color={health.riskScore > 50 ? 'red' : 'green'}>{health.summary}</Badge>}
            />
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {selectedVendor.sbom.length > 0 ? selectedVendor.sbom.map((comp, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded hover:border-slate-600">
                    <div className="flex items-center gap-3">
                        <Icons.Box className="w-4 h-4 text-slate-500" />
                        <div>
                        <div className="text-sm font-mono text-cyan-400 font-bold">{comp.name}</div>
                        <div className="text-[10px] text-slate-500">v{comp.version} • {comp.license}</div>
                        </div>
                    </div>
                    {comp.critical ? (
                        <Badge color="red">CRITICAL VULN FOUND</Badge>
                    ) : (
                        <Badge color="green">SECURE</Badge>
                    )}
                </div>
            )) : <div className="text-center py-12 text-slate-500 italic">No SBOM data available for this vendor.</div>}
            </div>
        </Card>
    </div>
  );
};
