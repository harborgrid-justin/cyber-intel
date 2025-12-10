
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
        // Deduplicate countries to minimize API calls
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <Card className="p-0 overflow-hidden relative">
            <CardHeader title="Jurisdictional Heatmap" className="absolute top-0 w-full z-10 bg-transparent border-none" />
            <div className="w-full h-full bg-slate-950 flex items-center justify-center p-8">
                {/* Abstract World Map Placeholder */}
                <svg className="w-full h-full text-slate-800" viewBox="0 0 100 50">
                    <path d="M20,10 Q30,5 40,12 T60,10 T80,15 T90,30 L85,40 H60 L50,30 L30,35 L20,40 Z" fill="currentColor" opacity="0.5" />
                    {/* Render dots for vendor locations */}
                    {vendors.map((v, i) => {
                        const score = assessments[v.hqLocation]?.score || 0;
                        const isRisky = score > 60;
                        // Mock coordinates based on simple hash of location string
                        const x = (v.hqLocation.length * 7) % 80 + 10; 
                        const y = (v.hqLocation.length * 3) % 40 + 5;
                        return (
                            <circle key={i} cx={x} cy={y} r="1.5" className={isRisky ? 'text-red-500 animate-pulse' : 'text-green-500'} fill="currentColor" />
                        );
                    })}
                </svg>
            </div>
        </Card>

        <div className="flex flex-col gap-6">
            <Card className="p-0 overflow-hidden flex-1 border-red-900/30">
                <CardHeader title="High Risk Jurisdictions" />
                <div className="p-4 space-y-3 overflow-y-auto">
                    {highRiskVendors.length > 0 ? highRiskVendors.map(v => {
                        const assessment = assessments[v.hqLocation];
                        return (
                            <div key={v.id} className="flex justify-between items-center bg-red-900/10 border border-red-900/30 p-3 rounded">
                                <div>
                                    <div className="font-bold text-red-200">{v.name}</div>
                                    <div className="text-xs text-red-300/70">{v.hqLocation} • {assessment?.label}</div>
                                </div>
                                <div className="text-2xl font-bold text-red-500">{assessment?.score}</div>
                            </div>
                        );
                    }) : <div className="text-center text-slate-500 py-4">No high risk vendors detected.</div>}
                </div>
            </Card>

            <Card className="p-0 overflow-hidden flex-1 border-green-900/30">
                <CardHeader title="Safe Harbor Vendors" />
                <div className="p-4 space-y-3 overflow-y-auto">
                    {safeVendors.map(v => {
                        const assessment = assessments[v.hqLocation];
                        return (
                            <div key={v.id} className="flex justify-between items-center bg-green-900/10 border border-green-900/30 p-3 rounded">
                                <div>
                                    <div className="font-bold text-green-200">{v.name}</div>
                                    <div className="text-xs text-green-300/70">{v.hqLocation}</div>
                                </div>
                                <div className="text-xl font-bold text-green-500">{assessment?.score}</div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    </div>
  );
};
