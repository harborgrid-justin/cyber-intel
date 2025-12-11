
import React, { useState, useEffect } from 'react';
import { Vendor } from '../../../types';
import { SupplyChainLogic } from '../../../services/logic/SupplyChainLogic';
import { Card, Grid, Badge, Button, ProgressBar } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';

interface Props {
  vendors: Vendor[];
}

export const AccessGovernance: React.FC<Props> = ({ vendors }) => {
  const vendorsWithAccess = vendors.filter(v => v.access.length > 0);
  const [audits, setAudits] = useState<Record<string, { violations: number, details: string[] }>>({});

  useEffect(() => {
    const fetchAudits = async () => {
      const results: Record<string, any> = {};
      for (const v of vendorsWithAccess) {
        results[v.id] = await SupplyChainLogic.auditLeastPrivilege(v.access);
      }
      setAudits(results);
    };
    fetchAudits();
  }, [vendors]);

  return (
    <div className="h-full overflow-y-auto p-1">
        <Grid cols={3}>
            {vendorsWithAccess.map(v => {
                const audit = audits[v.id] || { violations: 0, details: [] };
                const complianceScore = Math.max(0, 100 - (audit.violations * 25));
                
                return (
                    <Card key={v.id} className="p-0 overflow-hidden border-l-4 border-l-slate-700 hover:border-l-cyan-500 transition-colors flex flex-col h-full">
                        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-white text-lg">{v.name}</h3>
                                <div className="text-xs text-slate-500 mt-1">{v.category} Access</div>
                            </div>
                            <div className="text-right">
                                <div className={`text-2xl font-bold ${complianceScore < 100 ? 'text-red-500' : 'text-green-500'}`}>{complianceScore}%</div>
                                <div className="text-[9px] text-slate-500 uppercase font-bold">Privilege Score</div>
                            </div>
                        </div>

                        <div className="p-4 flex-1 space-y-3">
                             <div className="space-y-1 mb-4">
                                <div className="flex justify-between text-[10px] text-slate-400"><span>Compliance Check</span><span>{audit.violations} Issues</span></div>
                                <ProgressBar value={complianceScore} color={complianceScore === 100 ? 'green' : 'red'} />
                             </div>

                            {v.access.map((acc, i) => (
                                <div key={i} className="bg-slate-950 p-2 rounded border border-slate-800 text-xs flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <Icons.Server className="w-3 h-3 text-slate-600" />
                                        <div className="flex flex-col">
                                            <span className="text-slate-300 font-mono font-bold">{acc.systemId}</span>
                                            <span className="text-[9px] text-slate-600 uppercase">Accts: {acc.accountCount}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex gap-1">
                                            {acc.mfaEnabled ? <span className="text-[9px] text-green-500 bg-green-900/10 border border-green-900/30 px-1 rounded">MFA</span> : <span className="text-[9px] text-red-500 bg-red-900/10 border border-red-900/30 px-1 rounded animate-pulse">NO MFA</span>}
                                            <span className={`text-[9px] px-1 rounded font-bold border ${acc.accessLevel === 'ADMIN' ? 'text-red-400 border-red-900/50 bg-red-900/10' : 'text-cyan-500 border-cyan-900/50 bg-cyan-900/10'}`}>{acc.accessLevel}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {audit.details.length > 0 && (
                                <div className="bg-red-900/10 p-3 rounded text-[10px] text-red-200 mt-2 border-l-2 border-red-500">
                                    <div className="font-bold mb-1 uppercase tracking-wider flex items-center gap-2"><Icons.AlertTriangle className="w-3 h-3"/> Violations Detected</div>
                                    <ul className="list-disc pl-4 space-y-1 text-red-300/80">
                                        {audit.details.map((d, i) => <li key={i}>{d}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-slate-900/50 border-t border-slate-800 mt-auto flex gap-2">
                            <Button variant="outline" className="flex-1 text-[10px] py-1 h-7">AUDIT LOGS</Button>
                            {audit.violations > 0 && <Button variant="danger" className="flex-1 text-[10px] py-1 h-7">REVOKE ACCESS</Button>}
                        </div>
                    </Card>
                );
            })}
        </Grid>
    </div>
  );
};
