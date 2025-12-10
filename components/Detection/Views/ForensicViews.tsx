
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Badge, Button, Grid, ProgressBar } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { DetectionLogic } from '../../../services/logic/DetectionLogic';
import { IntersectionPruner } from '../../Shared/IntersectionPruner';

export const ForensicViews = {
  Network: () => {
    const pcaps = useDataStore(() => threatData.getNetworkCaptures());
    return (
      <Card className="h-full p-0 flex flex-col">
        <CardHeader title="Network Flow Analysis (PCAP)" />
        <div className="flex-1 overflow-y-auto p-4">
          {pcaps.map(p => (
            <IntersectionPruner key={p.id} height="40px">
                <div className="border-b border-slate-800 hover:bg-slate-900/50 p-2 flex justify-between text-xs font-mono">
                  <span className="text-slate-500">{p.date}</span>
                  <span className="text-red-400">{p.source}</span>
                  <Badge color="blue">{p.protocol}</Badge>
                  <span>{p.size}</span>
                </div>
            </IntersectionPruner>
          ))}
        </div>
      </Card>
    );
  },
  Memory: () => {
    const nodes = useDataStore(() => threatData.getSystemNodes());
    const [findings, setFindings] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const fetchMemory = async () => {
            const results: Record<string, string[]> = {};
            for (const n of nodes) {
                results[n.id] = await DetectionLogic.analyzeMemory(n);
            }
            setFindings(results);
        };
        fetchMemory();
    }, [nodes]);

    return (
      <div className="grid grid-cols-2 gap-6 h-full">
        <Card className="p-0 overflow-hidden">
          <CardHeader title="Active Process Tree" />
          <div className="p-4 space-y-2 font-mono text-xs text-slate-300">
            <div>System (4)</div>
            <div className="pl-4">└─ smss.exe (328)</div>
          </div>
        </Card>
        <div className="space-y-4 overflow-y-auto">
          {nodes.map(n => (
            <IntersectionPruner key={n.id} height="100px">
                <Card className="p-4">
                    <div className="font-bold text-white mb-2">{n.name}</div>
                    <div className="space-y-1">
                        {(findings[n.id] || []).map((f, i) => <div key={i} className="text-xs text-orange-400 bg-orange-900/10 p-2 rounded">⚠ {f}</div>)}
                    </div>
                </Card>
            </IntersectionPruner>
          ))}
        </div>
      </div>
    );
  },
  Disk: () => <div className="p-4 text-slate-500">MFT Analysis Module</div>
};
