
import React from 'react';
// Fix: Correct import path for UI components. The barrel file is UI.tsx, not ui/index.ts.
import { Card, CardHeader, Switch, Input, Select, Badge } from '../../Shared/UI';

interface Props {
  mfaEnforced: boolean;
  setMfaEnforced: (val: boolean) => void;
  sessionTimeout: string;
  setSessionTimeout: (val: string) => void;
}

export const SecurityPoliciesPanel: React.FC<Props> = ({ mfaEnforced, setMfaEnforced, sessionTimeout, setSessionTimeout }) => {
  return (
    <Card className="p-0 overflow-hidden">
        <CardHeader title="Security Policies" action={<Badge color="purple">ENFORCED</Badge>} />
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="font-bold text-white text-sm">Global MFA Enforcement</div>
                    <div className="text-xs text-slate-500">Require multi-factor authentication for all roles</div>
                </div>
                <Switch checked={mfaEnforced} onChange={setMfaEnforced} />
            </div>
            <div className="w-full h-px bg-[var(--colors-borderDefault)]"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Session Timeout (Minutes)</label>
                    <Input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="bg-[var(--colors-surfaceDefault)]" />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Password Rotation Policy</label>
                    <Select className="bg-[var(--colors-surfaceDefault)]"><option>Every 90 Days</option></Select>
                </div>
            </div>
        </div>
    </Card>
  );
};