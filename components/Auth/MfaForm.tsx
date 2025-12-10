
import React, { useState } from 'react';
import { Card, Input, Button } from '../Shared/UI';
import { WebAuthnService } from '../../services/security/WebAuthn';
import { Icons } from '../Shared/Icons';
import { EXECUTIVE_THEME, TOKENS } from '../../styles/theme';

export const MfaForm: React.FC<{ onVerify: () => void }> = ({ onVerify }) => {
  const [code, setCode] = useState('');
  const hasHardwareKey = WebAuthnService.isAvailable();

  const handleWebAuthn = async () => {
    const success = await WebAuthnService.authenticate();
    if (success) onVerify();
    else alert("Hardware Authentication Failed");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-slate-950/80 backdrop-blur-sm fixed inset-0 z-50`}>
        <Card className="w-full max-w-sm p-8 text-center border-slate-800 shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700">
               <Icons.Lock className="w-5 h-5 text-slate-400" />
            </div>
            <h2 className={`${EXECUTIVE_THEME.typography.h2} mb-2`}>Security Verification</h2>
            <p className={`text-sm text-[var(--colors-textSecondary)] mb-8`}>Enter code or use security key.</p>
            
            <Input 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                className="text-center text-2xl tracking-[0.5em] font-mono mb-8 h-14 bg-slate-950 border-slate-800 focus:border-blue-500 transition-colors" 
                maxLength={6} 
                placeholder="000000"
            />
            
            <div className="space-y-3">
                <Button onClick={onVerify} className="w-full" disabled={code.length !== 6}>VERIFY TOKEN</Button>
                {hasHardwareKey && (
                    <Button onClick={handleWebAuthn} variant="secondary" className="w-full">
                        <Icons.Key className="w-4 h-4 mr-2" /> USE HARDWARE KEY
                    </Button>
                )}
            </div>
        </Card>
    </div>
  );
};