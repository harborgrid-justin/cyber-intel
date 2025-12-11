
import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { DetectionLogic } from '../../../services/logic/DetectionLogic';
import { IntersectionPruner } from '../../Shared/IntersectionPruner';

export const MemoryForensics: React.FC = () => {
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
};
