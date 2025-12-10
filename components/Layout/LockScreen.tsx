
import React, { useState, useEffect } from 'react';
import { Icons } from '../Shared/Icons';
import { Button, Input } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { EXECUTIVE_THEME, TOKENS } from '../../styles/theme';

const LockScreen: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const currentUser = useDataStore(() => threatData.currentUser);

  useEffect(() => {
    let timer: any;
    const resetTimer = () => {
      if (!isLocked) {
        clearTimeout(timer);
        timer = setTimeout(() => setIsLocked(true), 300000); // 5 min idle
      }
    };

    const handleManualLock = () => setIsLocked(true);

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('lock-screen', handleManualLock);
    
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('lock-screen', handleManualLock);
      clearTimeout(timer);
    };
  }, [isLocked]);

  const handleUnlock = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Simulate auth check
    if (password.length > 0) {
        setIsLocked(false);
        setPassword('');
        setError(false);
    } else {
        setError(true);
    }
  };

  if (!isLocked) return null;

  return (
    <div className={`fixed inset-0 z-[100] ${EXECUTIVE_THEME.surfaces.app_container} flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]`}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-950/95"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-6 shadow-2xl relative">
           <Icons.UserX className={`w-10 h-10 text-[var(--colors-primary)]`} />
           <div className={`absolute bottom-0 right-0 w-6 h-6 bg-[var(--colors-error)] border-4 border-slate-800 rounded-full`}></div>
        </div>
        
        <h2 className={EXECUTIVE_THEME.typography.h1 + " mb-1 tracking-tight"}>{currentUser?.name || 'Authorized User'}</h2>
        <p className={EXECUTIVE_THEME.typography.mono_label + " mb-8"}>Session Locked • {currentUser?.clearance || 'Restricted'}</p>
        
        <form onSubmit={handleUnlock} className="w-full space-y-4">
            <div className="relative">
                <Input 
                    type="password" 
                    placeholder="Enter Credentials..." 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className={`text-center tracking-widest transition-all ${error ? `border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]` : `focus:border-[var(--colors-primary)] focus:shadow-[var(--shadow-glowPrimary)]`}`}
                    autoFocus
                />
            </div>
            <Button type="submit" className="w-full py-3">AUTHENTICATE</Button>
        </form>
        
        <div className="mt-8 text-[10px] text-slate-600 font-mono">
            UNAUTHORIZED ACCESS IS PROHIBITED AND MONITORED
        </div>
      </div>
    </div>
  );
};

export default LockScreen;