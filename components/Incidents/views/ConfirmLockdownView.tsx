
import React from 'react';
import { Button } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';

interface ConfirmLockdownViewProps {
  onConfirm: () => void;
  onAbort: () => void;
}

export const ConfirmLockdownView: React.FC<ConfirmLockdownViewProps> = ({ onConfirm, onAbort }) => {
  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-red-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="max-w-xl w-full text-center p-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-500/50 animate-pulse">
            <Icons.Lock className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-widest">Confirm System Lockdown</h1>
          <p className="text-red-200/80 text-sm mt-4 max-w-md">
            This will immediately sever all external network connections and revoke active sessions for non-admin users. This is a critical, audited action.
          </p>
          <div className="flex gap-4 mt-10 w-full max-w-sm">
            <Button onClick={onConfirm} variant="danger" className="w-full justify-center bg-red-600 hover:bg-red-700 text-white text-base py-3 shadow-2xl shadow-red-900/50">
                EXECUTE PROTOCOL
            </Button>
            <Button onClick={onAbort} variant="secondary" className="w-full justify-center text-base py-3">
                ABORT
            </Button>
          </div>
      </div>
    </div>
  );
};
