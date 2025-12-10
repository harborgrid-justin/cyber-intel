
import React, { useState } from 'react';
import { Card, Input, Button, Label } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { EXECUTIVE_THEME, TOKENS } from '../../styles/theme';

export const LoginForm: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const config = useDataStore(() => threatData.getAppConfig());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(creds.username && creds.password) onLogin();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[var(--colors-appBg)] p-4`}>
        <Card className="w-full max-w-md p-8 border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
            <div className="text-center mb-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-500`}>
                    <Icons.Shield className="w-8 h-8" />
                </div>
                <h1 className={EXECUTIVE_THEME.typography.h1}>{config.appName}</h1>
                <p className={`text-xs text-[var(--colors-textSecondary)] uppercase tracking-widest mt-2`}>{config.subtitle}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className='text-[var(--colors-textSecondary)]'>Identity</Label>
                  <Input 
                    value={creds.username} 
                    onChange={e => setCreds({...creds, username: e.target.value})} 
                    autoFocus 
                    className="bg-slate-900/50"
                  />
                </div>
                <div>
                  <Label className='text-[var(--colors-textSecondary)]'>Passcode</Label>
                  <Input 
                    type="password" 
                    value={creds.password} 
                    onChange={e => setCreds({...creds, password: e.target.value})} 
                    className="bg-slate-900/50"
                  />
                </div>
                <Button type="submit" className="w-full mt-2" size="md">AUTHENTICATE</Button>
            </form>
            <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-600">UNAUTHORIZED ACCESS IS PROHIBITED</p>
            </div>
        </Card>
    </div>
  );
};