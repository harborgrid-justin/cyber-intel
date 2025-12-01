
import React from 'react';
import { Card, CardHeader, Badge, Button, Grid, ProgressBar } from '../../Shared/UI';
import { threatData } from '../../services-frontend/dataLayer';
import { DetectionLogic } from '../../services-frontend/logic/DetectionLogic';

export const ForensicViews = {
  Network: () => {
    const pcaps = threatData.getNetworkCaptures();
    return (
      <Card className="h-full p-0 flex flex-col">
        <CardHeader title="Network Flow Analysis (PCAP)" />
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs font-mono text-slate-400">
            <thead className="bg-slate-900 text-slate-500"><tr><th className="p-2">Timestamp</th><th className="p-2">Source</th><th className="p-2">Dest</th><th className="p-2">Proto</th><th className="p-2">Size</th></tr></thead>
            <tbody>
              {pcaps.map((p, i) => (
                <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                  <td className="p-2">{p.date}</td>
                  <td className="p-2 text-red-400">{p.source}</td>
                  <td className="p-2">10.0.0.55</td>
                  <td className="p-2"><Badge color="blue">{p.protocol}</Badge></td>
                  <td className="p-2">{p.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  },

  Memory: () => {
    const nodes = threatData.getSystemNodes();
    return (
      <div className="grid grid-cols-2 gap-6 h-full">
        <Card className="p-0 overflow-hidden">
          <CardHeader title="Active Process Tree (Volatility)" />
          <div className="p-4 space-y-2 font-mono text-xs text-slate-300">
            <div>System (4)</div>
            <div className="pl-4">└─ smss.exe (328)</div>
            <div className="pl-8">└─ csrss.exe (452)</div>
            <div className="pl-8">└─ wininit.exe (512)</div>
            <div className="pl-12">└─ services.exe (620)</div>
            <div className="pl-16 text-red-500 font-bold">└─ svchost.exe (445) [INJECTED]</div>
          </div>
        </Card>
        <div className="space-y-4">
          {nodes.map(n => (
            <Card key={n.id} className="p-4">
              <div className="font-bold text-white mb-2">{n.name} - Memory Analysis</div>
              <div className="space-y-1">
                {DetectionLogic.analyzeMemory(n).map((finding, i) => (
                  <div key={i} className="text-xs text-orange-400 bg-orange-900/10 p-2 rounded border border-orange-900/30">
                    ⚠ {finding}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  },

  Disk: () => {
    const target = threatData.getSystemNodes()[0];
    const mft = DetectionLogic.analyzeDiskMFT(target);
    return (
      <Card className="h-full p-0 flex flex-col">
        <CardHeader title={`MFT Parser: ${target?.name || 'Localhost'}`} />
        <div className="flex-1 p-4 overflow-y-auto">
          {mft.map((entry, i) => (
            <div key={i} className="flex justify-between items-center p-2 border-b border-slate-800 font-mono text-xs hover:bg-slate-900">
              <span className="text-slate-300">{entry.file}</span>
              <Badge color={entry.status.includes('Created') ? 'red' : 'slate'}>{entry.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    );
  }
};
