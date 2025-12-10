
import React from 'react';
import { Card, Input, Button, Label } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { SystemUser } from '../../../types';

interface UserIdentityCardProps {
  securedUser: SystemUser;
  reveal: boolean;
  setReveal: (val: boolean) => void;
}

export const UserIdentityCard: React.FC<UserIdentityCardProps> = ({ securedUser, reveal, setReveal }) => (
    <Card className="p-0 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>
        <div className="px-8 pb-8">
            <div className="relative -mt-12 mb-6 flex justify-between items-end">
                <div className="flex items-end gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-slate-950 border-4 border-slate-800 flex items-center justify-center text-3xl font-bold text-white shadow-2xl relative overflow-hidden group">
                        {securedUser.name.charAt(0)}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Icons.Code className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="mb-1">
                        <h1 className="text-2xl font-bold text-white">{securedUser.name}</h1>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                            <span className="flex items-center gap-1"><Icons.Shield className="w-3 h-3 text-cyan-500" /> {securedUser.role}</span>
                            <span>•</span>
                            <span className="text-orange-400">{securedUser.clearance} CLEARANCE</span>
                        </div>
                    </div>
                </div>
                <Button onClick={() => setReveal(!reveal)} variant="secondary" className="text-xs">
                    {reveal ? <><Icons.UserX className="w-3 h-3 mr-2" /> HIDE PII</> : <><Icons.Users className="w-3 h-3 mr-2" /> REVEAL PII</>}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><Label>Full Name</Label><Input defaultValue={securedUser.name} className="bg-slate-950" /></div>
                <div>
                    <Label>Email Address</Label>
                    <div className="relative">
                        <Input value={securedUser.email || ''} readOnly className={`bg-slate-950 ${!reveal ? 'text-slate-500 italic tracking-widest' : ''}`} />
                        {!reveal && <div className="absolute right-3 top-2.5 text-[10px] text-slate-500 uppercase font-bold">Encrypted</div>}
                    </div>
                </div>
                <div><Label>Username</Label><Input value={securedUser.username} readOnly disabled className="bg-slate-900 text-slate-500 cursor-not-allowed" /></div>
                <div><Label>Organization ID</Label><Input defaultValue="ORG-8842-ALPHA" disabled className="bg-slate-900 text-slate-500 cursor-not-allowed" /></div>
            </div>
        </div>
    </Card>
);
