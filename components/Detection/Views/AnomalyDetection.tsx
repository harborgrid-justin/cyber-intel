
import React from 'react';
import { Card, CardHeader, ProgressBar } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';

export const AnomalyDetection: React.FC = () => {
    const nodes = useDataStore(() => threatData.getSystemNodes());
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nodes.map(n => (
          <Card key={n.id} className="p-6">
            <CardHeader title={n.name} className="p-0 border-0 bg-transparent mb-4" />
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>CPU Deviation</span><span>{n.load > 80 ? '+2.4σ' : '+0.1σ'}</span></div>
                <ProgressBar value={n.load} color={n.load > 80 ? 'red' : 'blue'} />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Network Outbound</span><span>{n.load > 50 ? 'High' : 'Normal'}</span></div>
                <div className="h-10 flex items-end gap-1 mt-2">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="flex-1 bg-slate-800 hover:bg-cyan-500 transition-colors" style={{ height: `${Math.random() * (n.load > 80 ? 100 : 40)}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
};
