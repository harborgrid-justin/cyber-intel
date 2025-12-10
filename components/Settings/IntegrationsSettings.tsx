
import React from 'react';
import { Card, CardHeader, Badge, Button, Grid } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';

export const IntegrationsSettings: React.FC = () => {
  const integrations = useDataStore(() => threatData.getIntegrations());

  // Helper to map type string to icon component dynamically
  const getIcon = (type: string) => {
      switch(type.toUpperCase()) {
          case 'SIEM': return <Icons.Server className="w-6 h-6" />;
          case 'TICKETING': return <Icons.Box className="w-6 h-6" />;
          case 'MESSAGING': return <Icons.Activity className="w-6 h-6" />;
          case 'ITSM': return <Icons.Layers className="w-6 h-6" />;
          case 'INTEL': return <Icons.Shield className="w-6 h-6" />;
          default: return <Icons.Globe className="w-6 h-6" />;
      }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded border border-slate-800">
            <div>
                <h3 className="font-bold text-white">Integration Hub</h3>
                <p className="text-xs text-slate-500">Connect external tools to enrich data and automate response.</p>
            </div>
            <Button>+ ADD INTEGRATION</Button>
        </div>

        <Grid cols={3}>
            {integrations.map((int, i) => (
                <Card key={i} className="p-5 flex flex-col gap-4 group hover:border-cyan-500 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                            {getIcon(int.type)}
                        </div>
                        <Badge color={int.status === 'Connected' ? 'green' : int.status === 'PENDING' ? 'yellow' : 'slate'}>{int.status}</Badge>
                    </div>
                    
                    <div>
                        <div className="font-bold text-white text-lg">{int.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">{int.type}</div>
                        <p className="text-xs text-slate-400">{int.desc || 'No description provided.'}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800 mt-auto flex gap-2">
                        <Button variant="secondary" className="flex-1 text-xs">CONFIGURE</Button>
                        <Button variant="text" className="text-slate-500 hover:text-white"><Icons.Refresh className="w-4 h-4" /></Button>
                    </div>
                </Card>
            ))}
        </Grid>
    </div>
  );
};
