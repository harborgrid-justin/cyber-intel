
import React from 'react';
import { Card, CardHeader, Badge } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { IntersectionPruner } from '../../Shared/IntersectionPruner';

export const NetworkForensics: React.FC = () => {
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
};
