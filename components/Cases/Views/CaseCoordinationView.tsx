
import React from 'react';
import { Case } from '../../../types';
import { Button, Card } from '../../Shared/UI';

interface CaseCoordinationViewProps {
  activeCase: Case;
  onTransfer: (agency: string) => void;
  onShare: (agency: string) => void;
}

const CaseCoordinationView: React.FC<CaseCoordinationViewProps> = ({ activeCase, onTransfer, onShare }) => {
  return (
    <div className="space-y-6">
      <Card className="p-4 border-l-4 border-l-purple-500 bg-slate-950">
         <h3 className="text-sm font-bold text-white mb-2">Agency Ownership</h3>
         <p className="text-xs text-slate-400 mb-4">Current jurisdiction belongs to <span className="text-white font-bold">{activeCase.agency}</span>. Transferring ownership will revoke write access for local analysts.</p>
         <div className="flex gap-2">
           <Button onClick={() => onTransfer('FBI_CYBER')} variant="outline" className="hover:bg-purple-900/20 hover:border-purple-500 hover:text-purple-400">TRANSFER TO FBI</Button>
           <Button onClick={() => onTransfer('INTERPOL')} variant="outline" className="hover:bg-purple-900/20 hover:border-purple-500 hover:text-purple-400">TRANSFER TO INTERPOL</Button>
         </div>
      </Card>
      
      <Card className="p-4 border-l-4 border-l-blue-500 bg-slate-950">
         <h3 className="text-sm font-bold text-white mb-2">Joint Task Force Sharing</h3>
         <p className="text-xs text-slate-400 mb-4">Sharing provides read-only access to partner agencies while maintaining local chain of custody.</p>
         <div className="flex gap-2 flex-wrap">
           <Button onClick={() => onShare('NSA')} variant="outline" className="border-blue-900 text-blue-400 hover:bg-blue-900/20 hover:border-blue-500">SHARE: NSA</Button>
           <Button onClick={() => onShare('CISA')} variant="outline" className="border-blue-900 text-blue-400 hover:bg-blue-900/20 hover:border-blue-500">SHARE: CISA</Button>
         </div>
         <div className="mt-4 text-xs text-slate-500 font-mono p-2 bg-slate-900 rounded border border-slate-800">
           Currently Shared With: <span className="text-blue-400">{activeCase.sharedWith.join(', ') || 'None'}</span>
         </div>
      </Card>
    </div>
  );
};
export default CaseCoordinationView;
