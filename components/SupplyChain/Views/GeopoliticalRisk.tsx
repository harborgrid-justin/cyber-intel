
import React, { useState, useEffect } from 'react';
import { Vendor } from '../../../types';
import { Card, CardHeader } from '../../Shared/UI';
import { SupplyChainLogic } from '../../../services/logic/SupplyChainLogic';

interface Props {
  vendors: Vendor[];
}

export const GeopoliticalRisk: React.FC<Props> = ({ vendors }) => {
  const [assessments, setAssessments] = useState<Record<string, { score: number, label: string }>>({});

  useEffect(() => {
    const load = async () => {
        const results: Record<string, any> = {};
        const countries: string[] = Array.from(new Set(vendors.map(v => v.hqLocation)));
        
        await Promise.all(countries.map(async (c) => {
            results[c] = await SupplyChainLogic.assessJurisdictionalRisk(c);
        }));
        setAssessments(results);
    };
    load();
  }, [vendors]);

  const highRiskVendors = vendors.filter(v => (assessments[v.hqLocation]?.score || 0) > 60);
  const safeVendors = vendors.filter(v => (assessments[v.hqLocation]?.score || 0) <= 30);
  const moderateVendors = vendors.filter(v => {
      const s = assessments[v.hqLocation]?.score || 0;
      return s > 30 && s <= 60;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <Card className="p-0 overflow-hidden relative border-t-4 border-t-slate-700">
            <CardHeader title="Jurisdictional Heatmap" className="absolute top-0 w-full z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800" />
            <div className="w-full h-full bg-[#0b1120] flex items-center justify-center p-8 relative">
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                
                {/* Simplified Map Representation */}
                <div className="relative w-full aspect-[2/1] border border-slate-800 rounded bg-slate-900/50">
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-700 font-bold uppercase tracking-[1em] pointer-events-none select-none">Global Operations Map</div>
                    
                    {/* Render dots for vendor locations */}
                    {vendors.map((v, i) => {
                        const score = assessments[v.hqLocation]?.score || 0;
                        const isRisky = score > 60;
                        const color = isRisky ? 'text-red-500' : score > 30 ? 'text-yellow-500' : 'text-green-500';
                        
                        // Deterministic Pseudo-random coordinates based on location string hash
                        const hash = v.hqLocation.split('').reduce((a,b)=>a+b.charCodeAt(0),0);
                        const x = (hash % 80) + 10; 
                        const y = ((hash * 13) % 60) + 20;

                        return (
                            <div key={i} className={`absolute group cursor-pointer`} style={{ left: `${x}%`, top: `${y}%` }}>
                                <div className={`w-3 h-3 ${color} relative flex items-center justify-center`}>
                                    <div className={`absolute w-full h-full rounded-full bg-current opacity-20 ${isRisky ? 'animate-ping' : ''}`}></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[9px] whitespace-nowrap z-20 shadow-xl text-white">
                                    {v.name} ({v.hqLocation})
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>

        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar h-full pb-2">
            <Card className="p-0 overflow-hidden shrink-0 border-l-4 border-l-red-600 bg-red-900/5">
                <CardHeader title="High Risk Jurisdictions" />
                <div className="p-4 space-y-2">
                    {highRiskVendors.length > 0 ? highRiskVendors.map(v => (
                        <div key={v.id} className="flex justify-between items-center bg-slate-900/80 border border-slate-800 p-2 rounded">
                            <div><div className="font-bold text-red-300 text-sm">{v.name}</div><div className="text-[10px] text-slate-500">{v.hqLocation} • {assessments[v.hqLocation]?.label}</div></div>
                            <div className="text-xl font-bold text-red-500">{assessments[v.hqLocation]?.score}</div>
                        </div>
                    )) : <div className="text-center text-slate-500 text-xs py-2">No active high-risk exposure.</div>}
                </div>
            </Card>
            
            {moderateVendors.length > 0 && (
                <Card className="p-0 overflow-hidden shrink-0 border-l-4 border-l-yellow-500 bg-yellow-900/5">
                    <CardHeader title="Moderate Risk" />
                    <div className="p-4 space-y-2">
                        {moderateVendors.map(v => (
                            <div key={v.id} className="flex justify-between items-center bg-slate-900/80 border border-slate-800 p-2 rounded">
                                <div><div className="font-bold text-yellow-300 text-sm">{v.name}</div><div className="text-[10px] text-slate-500">{v.hqLocation}</div></div>
                                <div className="text-xl font-bold text-yellow-500">{assessments[v.hqLocation]?.score}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card className="p-0 overflow-hidden shrink-0 border-l-4 border-l-green-500 bg-green-900/5">
                <CardHeader title="Safe Harbor" />
                <div className="p-4 space-y-2">
                    {safeVendors.map(v => (
                        <div key={v.id} className="flex justify-between items-center bg-slate-900/80 border border-slate-800 p-2 rounded">
                            <div><div className="font-bold text-green-300 text-sm">{v.name}</div><div className="text-[10px] text-slate-500">{v.hqLocation}</div></div>
                            <div className="text-xl font-bold text-green-500">{assessments[v.hqLocation]?.score}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
  );
};
