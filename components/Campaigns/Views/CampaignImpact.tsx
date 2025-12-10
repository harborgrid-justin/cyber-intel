
import React, { useEffect, useState } from 'react';
import { Campaign } from '../../../types';
import { RiskLogic, RiskAnalysisResult } from '../../../services/logic/RiskLogic';
import { Card, Grid, ProgressBar, CardHeader } from '../../Shared/UI';

interface Props { campaign: Campaign; compact?: boolean; }

// Helper for counting up animation
const AnimatedValue = ({ value, format = 'currency' }: { value: number, format?: 'currency' | 'percent' | 'number' }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);
            
            setDisplay(start + (end - start) * ease);

            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value]);

    if (format === 'currency') return <>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(display)}</>;
    if (format === 'percent') return <>{Math.round(display)}%</>;
    return <>{Math.round(display).toLocaleString()}</>;
};

const CampaignImpact: React.FC<Props> = ({ campaign, compact = false }) => {
  const [analysis, setAnalysis] = useState<RiskAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
        setLoading(true);
        const result = await RiskLogic.calculateCampaignRisk(campaign);
        setAnalysis(result);
        setLoading(false);
    };
    fetchRisk();
  }, [campaign]);

  // Dynamic Layout Classes based on 'compact' prop (Autoscale)
  const gridClass = compact ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-3 gap-6";
  const bottomGridClass = compact ? "flex flex-col gap-4" : "grid grid-cols-1 lg:grid-cols-2 gap-6";
  const textScale = compact ? "text-2xl" : "text-3xl lg:text-4xl";

  if (loading || !analysis) {
      return <div className="p-12 text-center text-slate-500 animate-pulse">Calculating Financial Exposure...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Level KPI */}
      <div className={gridClass}>
         <Card className="p-6 bg-slate-900 border-l-4 border-l-red-600 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 text-9xl font-black text-red-500 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700 select-none">$</div>
            <div className="relative z-10">
               <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Projected Financial Exposure</h3>
               <div className={`${textScale} font-mono text-white font-bold tracking-tight`}>
                  <AnimatedValue value={analysis.exposure} />
               </div>
               <div className="text-[10px] text-slate-500 mt-2">Value at Risk (VaR) based on asset density</div>
            </div>
         </Card>

         <Card className="p-6 bg-slate-900 border-l-4 border-l-orange-500 relative overflow-hidden">
            <h3 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Brand Reputation Risk</h3>
            <div className={`${textScale} font-mono text-white font-bold`}>{analysis.brandImpact}</div>
            <div className="text-[10px] text-slate-500 mt-2">Sentiment analysis of related sectors</div>
            {/* Dynamic Status Pulse */}
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${analysis.brandImpact === 'SEVERE' ? 'bg-red-500 animate-ping' : 'bg-orange-500'}`}></div>
         </Card>

         <Card className="p-6 bg-slate-900 border-l-4 border-l-blue-500">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Active Containment</h3>
            <div className={`${textScale} font-mono text-white font-bold`}>
                <AnimatedValue value={45} format="percent" />
            </div>
            <div className="text-[10px] text-slate-500 mt-2">Metric Synced from SOAR</div>
            <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `45%` }}></div>
            </div>
         </Card>
      </div>

      {/* Breakdown & Regulatory */}
      <div className={bottomGridClass}>
         <Card className="p-0 overflow-hidden">
            <CardHeader title="Loss Breakdown (Estimated)" />
            <div className="p-6 space-y-4">
               <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Data Breach & Liability</span><span className="text-white font-mono"><AnimatedValue value={analysis.breakdown.dataBreachCost} /></span></div>
                  <ProgressBar value={(analysis.breakdown.dataBreachCost / Math.max(1, analysis.exposure)) * 100} color="red" />
               </div>
               <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Operational Downtime</span><span className="text-white font-mono"><AnimatedValue value={analysis.breakdown.downtimeCost} /></span></div>
                  <ProgressBar value={(analysis.breakdown.downtimeCost / Math.max(1, analysis.exposure)) * 100} color="orange" />
               </div>
               <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Incident Response & Recovery</span><span className="text-white font-mono"><AnimatedValue value={analysis.breakdown.remediationCost} /></span></div>
                  <ProgressBar value={(analysis.breakdown.remediationCost / Math.max(1, analysis.exposure)) * 100} color="blue" />
               </div>
            </div>
         </Card>

         <Card className="p-0 overflow-hidden">
            <CardHeader title="Regulatory & Compliance Impact" />
            <div className="p-6 space-y-3">
               {analysis.regulatoryRisks.length > 0 ? analysis.regulatoryRisks.map(r => (
                  <div key={r} className="bg-red-900/10 border border-red-900/30 p-3 rounded flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                     <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                     <span className="text-sm font-bold text-red-200">{r}</span>
                  </div>
               )) : <div className="text-center text-slate-500 py-8 border-2 border-dashed border-slate-800 rounded">No major regulatory flags detected.</div>}
            </div>
         </Card>
      </div>
    </div>
  );
};
export default CampaignImpact;
