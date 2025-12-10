
import React, { useState, useEffect } from 'react';
import { Vendor } from '../../../types';
import { SupplyChainLogic } from '../../../services/logic/SupplyChainLogic';
import { Card, Grid, Badge, Button } from '../../Shared/UI';

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
    <Grid cols={3}>
        {vendorsWithAccess.map(v => {
            const audit = audits[v.id] || { violations: 0, details: [] };
            return (
                <Card key={v.id} className="p-4 flex flex-col gap-3 border-l-4 border-l-slate-700 hover:border-l-cyan-500 transition-colors">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white">{v.name}</h3>
                        <Badge color={audit.violations > 0 ? 'red' : 'green'}>
                            {audit.violations > 0 ? `${audit.violations} VIOLATIONS` : 'COMPLIANT'}
                        </Badge>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                        {v.access.map((acc, i) => (
                            <div key={i} className="bg-slate-950 p-2 rounded border border-slate-800 text-xs flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-slate-300 font-mono">{acc.systemId}</span>
                                    <span className="text-[9px] text-slate-600 uppercase">Last Audit: {acc.lastAudit || 'Never'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {acc.mfaEnabled ? <span className="text-[9px] text-green-500 border border-green-900 px-1 rounded">MFA</span> : <span className="text-[9px] text-red-500 border border-red-900 px-1 rounded">NO MFA</span>}
                                    <span className={`font-bold ${acc.accessLevel === 'ADMIN' ? 'text-red-400' : 'text-cyan-500'}`}>{acc.accessLevel}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {audit.details.length > 0 && (
                        <div className="bg-red-900/10 p-2 rounded text-[10px] text-red-300 mt-1">
                            <div className="font-bold mb-1">Audit Findings:</div>
                            <ul className="list-disc pl-3">
                                {audit.details.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="mt-auto pt-2 flex gap-2">
                        <Button variant="outline" className="flex-1 text-[10px] py-1">REVIEW ACCESS</Button>
                        {audit.violations > 0 && <Button variant="danger" className="flex-1 text-[10px] py-1">REVOKE</Button>}
                    </div>
                </Card>
            );
        })}
    </Grid>
  );
};
