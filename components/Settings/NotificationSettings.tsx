
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Switch, Badge } from '../Shared/UI';
import { DesktopNotifier } from '../../services/notifications/DesktopNotifier';
import { Icons } from '../Shared/Icons';

export const NotificationSettings: React.FC = () => {
  const [desktopEnabled, setDesktopEnabled] = useState(false);
  const [prefs, setPrefs] = useState({
      security_alerts: { email: true, push: true, slack: true },
      system_updates: { email: false, push: true, slack: false },
      mentions: { email: true, push: true, slack: true }
  });

  useEffect(() => {
    if ('Notification' in window) {
        setDesktopEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleToggleDesktop = async (val: boolean) => {
    if (val) {
        const granted = await DesktopNotifier.requestPermission();
        setDesktopEnabled(granted);
        if(granted) DesktopNotifier.notify("Notifications Enabled", { body: "You will now receive desktop alerts." });
    } else {
        setDesktopEnabled(false);
    }
  };

  const togglePref = (category: keyof typeof prefs, channel: keyof typeof prefs.security_alerts) => {
      setPrefs(p => ({
          ...p,
          [category]: { ...p[category], [channel]: !p[category][channel] }
      }));
  };

  const renderRow = (label: string, category: keyof typeof prefs, icon: React.ReactNode) => (
      <div className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-slate-800 last:border-0">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="p-2 bg-slate-800 rounded text-slate-400 border border-slate-700">{icon}</div>
              <div>
                  <div className="font-bold text-white text-sm">{label}</div>
                  <div className="text-xs text-slate-500">Configure channels for this category</div>
              </div>
          </div>
          <div className="flex gap-8">
              <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Email</span>
                  <Switch checked={prefs[category].email} onChange={() => togglePref(category, 'email')} />
              </div>
              <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Push</span>
                  <Switch checked={prefs[category].push} onChange={() => togglePref(category, 'push')} />
              </div>
              <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Slack</span>
                  <Switch checked={prefs[category].slack} onChange={() => togglePref(category, 'slack')} />
              </div>
          </div>
      </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
        <Card className="p-6 bg-slate-900 flex items-center justify-between border-l-4 border-l-cyan-500">
            <div>
                <h3 className="font-bold text-white text-lg">Global Desktop Alerts</h3>
                <p className="text-sm text-slate-400">Allow browser-level notifications for critical events even when the tab is backgrounded.</p>
            </div>
            <div className="flex items-center gap-3">
                <Badge color={desktopEnabled ? 'green' : 'slate'}>{desktopEnabled ? 'ALLOWED' : 'BLOCKED'}</Badge>
                <Switch checked={desktopEnabled} onChange={handleToggleDesktop} />
            </div>
        </Card>

        <Card className="p-0 overflow-hidden">
            <CardHeader title="Event Categories" />
            <div className="px-6">
                {renderRow('Security Alerts', 'security_alerts', <Icons.AlertTriangle className="w-5 h-5" />)}
                {renderRow('System Updates', 'system_updates', <Icons.Server className="w-5 h-5" />)}
                {renderRow('Mentions & Tasks', 'mentions', <Icons.Users className="w-5 h-5" />)}
            </div>
        </Card>
    </div>
  );
};
