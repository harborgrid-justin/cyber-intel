
import React from 'react';
import { Vendor } from '../../../types';
import { Icons } from '../../Shared/Icons';
import { Button, Card, Badge } from '../../Shared/UI';

interface Props {
  vendors: Vendor[];
}

export const ComplianceTracker: React.FC<Props> = ({ vendors }) => {
  return (
    <div className="space-y-4 h-full overflow-y-auto custom-scrollbar p-1">
        {vendors.map(v => {
            const hasCerts = v.compliance.length > 0;
            const hasExpired = v.compliance.some(c => c.status === 'EXPIRED');
            const statusColor = !hasCerts ? 'red' : hasExpired ? 'orange' : 'green';

            return (
                <div key={v.id} className={`bg-slate-900 border border-slate-800 p-0 rounded-lg flex flex-col md:flex-row overflow-hidden transition-all hover:border-slate-600 ${!hasCerts ? 'border-l-4 border-l-red-500' : ''}`}>
                    {/* Header Section */}
                    <div className="p-4 w-full md:w-64 bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-white text-lg">{v.name}</div>
                            <Badge color={v.category === 'Cloud' ? 'cyan' : 'slate'}>{v.category}</Badge>
                        </div>
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{v.tier} Partner</div>
                        
                        <div className={`mt-3 text-[10px] font-bold px-2 py-1 rounded w-fit flex items-center gap-2 ${
                            statusColor === 'red' ? 'bg-red-900/20 text-red-500 border border-red-900/50' :
                            statusColor === 'orange' ? 'bg-orange-900/20 text-orange-500 border border-orange-900/50' :
                            'bg-green-900/20 text-green-500 border border-green-900/50'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${statusColor === 'red' ? 'bg-red-500' : statusColor === 'orange' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                            {hasCerts ? (hasExpired ? 'ATTENTION REQUIRED' : 'COMPLIANT') : 'NON-COMPLIANT'}
                        </div>
                    </div>
                    
                    {/* Certs Grid */}
                    <div className="flex-1 p-4 flex flex-col justify-center">
                        {hasCerts ? (
                            <div className="flex flex-wrap gap-3">
                                {v.compliance.map((c, i) => (
                                    <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded border text-xs min-w-[160px] justify-between ${
                                        c.status === 'VALID' ? 'bg-green-900/5 border-green-900/30 text-green-400' :
                                        c.status === 'EXPIRED' ? 'bg-red-900/5 border-red-900/30 text-red-400' :
                                        'bg-yellow-900/5 border-yellow-900/30 text-yellow-400'
                                    }`}>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{c.standard}</span>
                                            <span className="opacity-70 text-[9px] uppercase">{c.status}</span>
                                        </div>
                                        <div className="text-right">
                                            {c.status === 'VALID' ? <Icons.CheckCircle className="w-4 h-4"/> : <Icons.AlertTriangle className="w-4 h-4"/>}
                                            <div className="text-[9px] font-mono mt-1 opacity-50">{c.expiry}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-red-400 bg-red-900/5 border border-red-900/20 p-3 rounded">
                                <Icons.AlertTriangle className="w-5 h-5 shrink-0" />
                                <div>
                                    <div className="font-bold text-sm">No certifications on file.</div>
                                    <div className="text-[10px] opacity-80">Vendor has not provided evidence of compliance controls. High risk factor.</div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Actions */}
                    <div className="p-4 bg-slate-950/30 border-t md:border-t-0 md:border-l border-slate-800 flex flex-row md:flex-col justify-center gap-2 min-w-[120px]">
                        <Button variant="primary" className="flex-1 text-[10px]">REQUEST AUDIT</Button>
                        <Button variant="outline" className="flex-1 text-[10px]">UPLOAD CERT</Button>
                    </div>
                </div>
            );
        })}
    </div>
  );
};
