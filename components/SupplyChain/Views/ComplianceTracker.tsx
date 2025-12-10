
import React from 'react';
import { Vendor } from '../../../types';
import { Icons } from '../../Shared/Icons';
import { Button } from '../../Shared/UI';

interface Props {
  vendors: Vendor[];
}

export const ComplianceTracker: React.FC<Props> = ({ vendors }) => {
  return (
    <div className="space-y-4">
        {vendors.map(v => (
            <div key={v.id} className="bg-slate-900 border border-slate-800 p-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="w-48">
                    <div className="font-bold text-white">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.category}</div>
                </div>
                
                <div className="flex-1 flex flex-wrap gap-4">
                    {v.compliance.map((c, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-1 rounded border text-xs min-w-[140px] justify-between ${
                            c.status === 'VALID' ? 'bg-green-900/10 border-green-900 text-green-400' :
                            c.status === 'EXPIRED' ? 'bg-red-900/10 border-red-900 text-red-400' :
                            'bg-yellow-900/10 border-yellow-900 text-yellow-400'
                        }`}>
                            <div className="flex items-center gap-2">
                                {c.status === 'VALID' ? <Icons.CheckCircle className="w-3 h-3"/> : <Icons.AlertTriangle className="w-3 h-3"/>}
                                <span className="font-bold">{c.standard}</span>
                            </div>
                            <span className="opacity-50 text-[9px] font-mono">{c.expiry}</span>
                        </div>
                    ))}
                    {v.compliance.length === 0 && <span className="text-xs text-slate-500 italic">No certifications on file.</span>}
                </div>
                
                <div className="flex gap-2 shrink-0">
                    <Button variant="text" className="text-xs text-cyan-500">REQUEST AUDIT</Button>
                    <Button variant="outline" className="text-xs">UPLOAD CERT</Button>
                </div>
            </div>
        ))}
    </div>
  );
};
