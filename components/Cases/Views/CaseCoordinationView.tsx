
import React from 'react';
import { Case } from '../../../types';
import { Button, Card, CardHeader } from '../../Shared/UI';

interface CaseCoordinationViewProps {
  activeCase: Case;
  onTransfer: (agency: string) => void;
  onShare: (agency: string) => void;
}

const CaseCoordinationView: React.FC<CaseCoordinationViewProps> = ({ activeCase, onTransfer, onShare }) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card className="p-0 overflow-hidden border-l-4 border-l-purple-500 bg-slate-950 flex-1">
         <CardHeader title="Agency Jurisdiction" />
         <div className="p-6">
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
               Current jurisdiction belongs to <span className="text-white font-bold">{activeCase.agency}</span>. 
               Transferring ownership will revoke write access for local analysts and move the case to the target agency's secure enclave.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => onTransfer('FBI_CYBER')} variant="outline" className="border-purple-900 text-purple-400 hover:bg-purple-900/20 hover:border-purple-500 flex-1">TRANSFER TO FBI</Button>
              <Button onClick={() => onTransfer('INTERPOL')} variant="outline" className="border-purple-900 text-purple-400 hover:bg-purple-900/20 hover:border-purple-500 flex-1">TRANSFER TO INTERPOL</Button>
            </div>
         </div>
      </Card>
      
      <Card className="p-0 overflow-hidden border-l-4 border-l-blue-500 bg-slate-950 flex-1">
         <CardHeader title="Joint Task Force Sharing" />
         <div className="p-6">
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
               Sharing provides read-only access to partner agencies while maintaining local chain of custody. This action is logged in the inter-agency ledger.
            </p>
            <div className="flex gap-3 flex-wrap mb-6">
              <Button onClick={() => onShare('NSA')} variant="outline" className="border-blue-900 text-blue-400 hover:bg-blue-900/20 hover:border-blue-500 flex-1">SHARE: NSA</Button>
              <Button onClick={() => onShare('CISA')} variant="outline" className="border-blue-900 text-blue-400 hover:bg-blue-900/20 hover:border-blue-500 flex-1">SHARE: CISA</Button>
            </div>
            <div className="text-xs text-slate-500 font-mono p-3 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
              <span>ACTIVE PARTNERS:</span>
              <span className="text-blue-400 font-bold">{activeCase.sharedWith.length > 0 ? activeCase.sharedWith.join(', ') : 'NONE'}</span>
            </div>
         </div>
      </Card>
    </div>
  );
};
export default CaseCoordinationView;
