
import React, { useState } from 'react';
import { Button } from './UI';
import { Portal } from './Portal';
import { FocusTrap } from './FocusTrap';

export const ClassificationBanner: React.FC<{ position: 'top' | 'bottom' }> = ({ position }) => {
  return (
    <div className={`
      w-full h-6 bg-green-700 flex items-center justify-center z-[100] select-none
      ${position === 'top' ? 'border-b border-green-900' : 'border-t border-green-900'}
    `}>
      <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">
        CUI // SP-NIST-800-171 // FEDRAMP MODERATE
      </span>
    </div>
  );
};

export const SystemUseNotification: React.FC = () => {
  const [acknowledged, setAcknowledged] = useState(false);

  if (acknowledged) return null;

  return (
    <Portal>
      <FocusTrap isActive={true}>
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-xl">
              <h3 className="text-lg font-bold text-white tracking-wide uppercase">USG SYSTEM USE NOTIFICATION</h3>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 border border-slate-800 rounded font-mono text-xs text-slate-300 leading-relaxed h-64 overflow-y-auto custom-scrollbar">
                  <p className="mb-2 font-bold text-white">YOU ARE ACCESSING A U.S. GOVERNMENT (USG) INFORMATION SYSTEM (IS) THAT IS PROVIDED FOR USG-AUTHORIZED USE ONLY.</p>
                  <p className="mb-2">By using this IS (which includes any device attached to this IS), you consent to the following conditions:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>The USG routinely intercepts and monitors communications on this IS for purposes including, but not limited to, penetration testing, COMSEC monitoring, network operations and defense, personnel misconduct (PM), law enforcement (LE), and counterintelligence (CI) investigations.</li>
                    <li>At any time, the USG may inspect and seize data stored on this IS.</li>
                    <li>Communications using, or data stored on, this IS are not private, are subject to routine monitoring, interception, and search, and may be disclosed or used for any USG-authorized purpose.</li>
                    <li>This IS includes security measures (e.g., authentication and access controls) to protect USG interests--not for your personal benefit or privacy.</li>
                  </ul>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setAcknowledged(true)} variant="primary" className="w-full">
                    I ACKNOWLEDGE AND CONSENT
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FocusTrap>
    </Portal>
  );
};

export const AuditFooter: React.FC = () => (
  <div className="bg-slate-950 text-[9px] text-slate-600 font-mono py-1 px-4 flex justify-between items-center border-t border-slate-900">
    <span>AUDIT_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
    <span>FIPS 140-2 VALIDATED | NIST 800-53 REV 5</span>
  </div>
);
