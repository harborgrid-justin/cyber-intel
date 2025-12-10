import React from 'react';
import { Case } from '../../../types';
import { Card } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { IncidentLogic } from '../../../services/logic/IncidentLogic';

export const IncidentUsers: React.FC<{ cases: Case[] }> = ({ cases }) => {
  const users = threatData.getSystemUsers();
  const logs = threatData.getAuditLogs();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
       {users.map(u => {
         const { score, level } = IncidentLogic.calculateUserRisk(u, logs);
         return (
            <Card key={u.id} className={`p-4 flex flex-col gap-3 hover:bg-slate-900/80 ${level === 'CRITICAL' ? 'border-red-500/50 bg-red-900/5' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">{u.name.substring(0,2).toUpperCase()}</div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{u.role}</div>
                    </div>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase">Insider Risk</span>
                        <span className={`text-xs font-bold ${level === 'CRITICAL' ? 'text-red-500' : 'text-green-500'}`}>{score}/100</span>
                    </div>
                    <span className="text-[10px] bg-slate-950 px-2 py-1 rounded">{u.clearance}</span>
                </div>
            </Card>
         );
       })}
    </div>
  );
};

export default IncidentUsers;
