
import React from 'react';
import { SystemNode } from '../../../types';
import { Icons } from '../../Shared/Icons';

interface TopologyNodeProps {
  node: SystemNode;
  isSelected: boolean;
  isTarget: boolean;
  isImpacted: boolean;
  isUnderAttack: boolean;
  onSelect: (id: string) => void;
}

export const TopologyNode = React.memo<TopologyNodeProps>(({ node, isSelected, isTarget, isImpacted, isUnderAttack, onSelect }) => (
    <div onClick={() => onSelect(node.id)} className={`w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-300 relative bg-slate-900 
        ${isSelected ? 'border-blue-500 bg-blue-900/20 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-20' : 
          isUnderAttack ? 'border-red-500 bg-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
          node.status === 'DEGRADED' ? 'border-orange-500 bg-orange-900/10' : 
          node.status === 'ISOLATED' ? 'border-slate-500 bg-slate-800' :
          'border-slate-700 hover:border-slate-500'} 
        ${isImpacted ? 'animate-pulse border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : ''}`}>
        
        <div className={`mb-1 ${node.type === 'Database' ? 'text-purple-400' : isUnderAttack ? 'text-red-400' : 'text-slate-300'}`}>
        {node.type === 'Database' ? <Icons.Database className="w-5 h-5 md:w-6 md:h-6" /> : node.type === 'Firewall' ? <Icons.Shield className="w-5 h-5 md:w-6 md:h-6" /> : <Icons.Monitor className="w-5 h-5 md:w-6 md:h-6" />}
        </div>
        <div className="text-[9px] md:text-[10px] font-bold text-center leading-tight text-slate-200 truncate w-full px-1">{node.name}</div>
        
        {isTarget && <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">TARGET</div>}
        {isUnderAttack && <div className="absolute -top-2 -left-2 bg-red-600 text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm animate-pulse">ALERT</div>}
        {node.status === 'ISOLATED' && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-[1px]"><Icons.Shield className="text-slate-300 w-6 h-6" /></div>}
    </div>
));
