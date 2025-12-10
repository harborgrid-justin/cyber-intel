
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, Button, Badge, Grid } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { createSecureProxy } from '../../services/security/SensitiveDataProxy';
import { UserIdentityCard } from './views/UserIdentityCard';

export const ProfileSettings: React.FC = () => {
  const [reveal, setReveal] = useState(false);
  const [userData] = useState(threatData.currentUser);
  
  // Mock Sessions
  const sessions = [
      { id: 'sess-1', ip: '10.0.0.5', device: 'MacBook Pro (Current)', active: true, lastSeen: 'Now' },
      { id: 'sess-2', ip: '192.168.1.42', device: 'Windows Workstation', active: false, lastSeen: '2h ago' },
  ];

  const securedUser = useMemo(() => {
    if (!userData) return null;
    return reveal ? userData : createSecureProxy(userData, ['email', 'username']);
  }, [userData, reveal]);

  if (!securedUser) return null;

  return (
    <div className="space-y-6 max-w-4xl">
        <UserIdentityCard securedUser={securedUser} reveal={reveal} setReveal={setReveal} />

        {/* Security & Sessions */}
        <Grid cols={2}>
            <Card className="p-0 overflow-hidden h-full">
                <CardHeader title="Security Status" />
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-800">
                        <div>
                            <div className="text-sm font-bold text-white">Multi-Factor Auth</div>
                            <div className="text-xs text-slate-500">Hardware Key (YubiKey)</div>
                        </div>
                        <Badge color="green">ENABLED</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-800">
                        <div>
                            <div className="text-sm font-bold text-white">Password Age</div>
                            <div className="text-xs text-slate-500">Last changed 42 days ago</div>
                        </div>
                        <Button variant="outline" className="text-[10px] py-1">ROTATE</Button>
                    </div>
                </div>
            </Card>

            <Card className="p-0 overflow-hidden h-full">
                <CardHeader title="Active Sessions" />
                <div className="divide-y divide-slate-800">
                    {sessions.map(s => (
                        <div key={s.id} className="p-4 flex justify-between items-center hover:bg-slate-900/50">
                            <div>
                                <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                    {s.device}
                                    {s.active && <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></span>}
                                </div>
                                <div className="text-xs text-slate-500 font-mono">{s.ip} • {s.lastSeen}</div>
                            </div>
                            {!s.active && <Button variant="text" className="text-red-500 text-[10px]">REVOKE</Button>}
                        </div>
                    ))}
                </div>
            </Card>
        </Grid>
    </div>
  );
};
