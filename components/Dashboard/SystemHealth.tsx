
import React from 'react';
import { SYSTEM_NODES } from '../../constants';
import { Card } from '../Shared/UI';

const SystemHealth: React.FC = () => {
  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Sensor Grid Status</h3>
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
      </div>
      <div className="space-y-4">
        {SYSTEM_NODES.map((node) => (
          <div key={node.id} className="group">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className={`font-bold ${node.status === 'ONLINE' ? 'text-green-500' : 'text-red-500'}`}>
                {node.name}
              </span>
              <span className="text-slate-500">{node.latency}ms</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  node.load > 80 ? 'bg-red-500' : node.load > 50 ? 'bg-yellow-500' : 'bg-cyan-600'
                }`} 
                style={{ width: `${node.load}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] text-slate-600 uppercase">Load: {node.load}%</span>
               <span className="text-[10px] text-slate-600 uppercase">Uptime: 99.9%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
export default SystemHealth;
    