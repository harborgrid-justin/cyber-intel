
import React from 'react';
import { Card, CardHeader, Badge } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks';

export const CorrelationView: React.FC = () => {
  const threats = useDataStore(() => threatData.getThreats().slice(0, 5));
  
  return (
    <Card className="h-full p-0 overflow-hidden flex flex-col">
        <CardHeader title="Cross-Case Correlation" />
        <div className="p-6 flex-1 overflow-auto">
            <table className="w-full text-left text-xs">
                <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                        <th className="p-2">Primary Indicator</th>
                        <th className="p-2">Correlated Artifacts</th>
                        <th className="p-2">Confidence</th>
                    </tr>
                </thead>
                <tbody>
                    {threats.map(t => (
                        <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-900">
                            <td className="p-3 font-mono text-cyan-400">{t.indicator}</td>
                            <td className="p-3 text-slate-300">
                                <div className="flex flex-wrap gap-2">
                                    <Badge color="slate">Case-{Math.floor(Math.random() * 100)}</Badge>
                                    <Badge color="slate">Actor-{Math.floor(Math.random() * 10)}</Badge>
                                </div>
                            </td>
                            <td className="p-3 font-bold text-white">{t.confidence}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
  );
};
