
import React, { useMemo } from 'react';
import { Campaign, Threat, Case } from '../../../types';
import { RiskLogic } from '../../../services/logic/RiskLogic';
import { threatData } from '../../../services/dataLayer';
import { Card, Grid, ProgressBar } from '../../Shared/UI';

interface Props { campaign: Campaign; }

const CampaignImpact: React.FC<Props> = ({ campaign }) => {
  const threats = threatData.getThreats().filter(t => campaign.threatIds.includes(t.id));
  const cases = threatData.getCases().filter(c => c.relatedThreatIds.some(tid => campaign.threatIds.includes(tid)));
  
  const analysis = useMemo(() => RiskLogic.calculateCampaignRisk(campaign, threats, cases), [campaign, threats, cases]);

  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Top Level KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6 bg-slate-900 border-l-4 border-l-red-600 relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-10 text-9xl font-black text-red-500">$</div>
            <div className="relative z-10">
               <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Projected Financial Exposure</h3>
               <div className="text-3xl font-mono text-white font-bold">{currency.format(analysis.exposure)}</div>
               <div className="text-[10px] text-slate-500 mt-2">Value at Risk (VaR) based on asset density</div>
            </div>
         </Card>

         <Card className="p-6 bg-slate-900 border-l-4 border-l-orange-500">
            <h3 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Brand Reputation Risk</h3>
            <div className="text-3xl font-mono text-white font-bold">{analysis.brandImpact}</div>
            <div className="text-[10px] text-slate-500 mt-2">Sentiment analysis of related sectors</div>
         </Card>

         <Card className="p-6 bg-slate-900 border-l-4 border-l-blue-500">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Active Containment</h3>
            <div className="text-3xl font-mono text-white font-bold">{(cases.filter(c => c.status === 'CLOSED').length / Math.max(1, cases.length) * 100).toFixed(0)}%</div>
            <div className="text-[10px] text-slate-500 mt-2">{cases.length} Total Incident Cases</div>
         </Card>
      </div>

      {/* Breakdown & Regulatory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Loss Breakdown (Estimated)</h3>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Data Breach & Liability</span><span>{currency.format(analysis.breakdown.dataBreachCost)}</span></div>
                  <ProgressBar value={(analysis.breakdown.dataBreachCost / analysis.exposure) * 100} color="red" />
               </div>
               <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Operational Downtime</span><span>{currency.format(analysis.breakdown.downtimeCost)}</span></div>
                  <ProgressBar value={(analysis.breakdown.downtimeCost / analysis.exposure) * 100} color="orange" />
               </div>
               <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Incident Response & Recovery</span><span>{currency.format(analysis.breakdown.remediationCost)}</span></div>
                  <ProgressBar value={(analysis.breakdown.remediationCost / analysis.exposure) * 100} color="blue" />
               </div>
            </div>
         </Card>

         <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Regulatory & Compliance Impact</h3>
            <div className="space-y-3">
               {analysis.regulatoryRisks.length > 0 ? analysis.regulatoryRisks.map(r => (
                  <div key={r} className="bg-red-900/10 border border-red-900/30 p-3 rounded flex items-center gap-3">
                     <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
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
