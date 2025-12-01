
import React, { useState } from 'react';
import { Threat, Case, Severity } from '../../types';
import { Button, Card, Badge } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import ChatInterface, { Message } from '../Shared/ChatInterface';

interface Props { threats: Threat[]; cases: Case[]; onUpdate: () => void; }

const WarRoom: React.FC<Props> = ({ threats, cases, onUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Situation Report requested.', timestamp: Date.now() - 100000, senderName: 'System' },
    { id: '2', role: 'user', text: 'Uplink established. Feeds live.', timestamp: Date.now() - 50000, senderName: 'Analyst.Cmd' }
  ]);
  
  const criticalThreats = threats.filter(t => t.severity === Severity.CRITICAL);
  const criticalCases = cases.filter(c => c.priority === 'CRITICAL');

  const handleLockdown = () => {
    alert("INITIATING NETWORK LOCKDOWN PROTOCOL...");
    criticalThreats.forEach(t => threatData.updateStatus(t.id, 'CONTAINED' as any));
    onUpdate();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: 'ALERT: EMERGENCY LOCKDOWN INITIATED', timestamp: Date.now(), senderName: 'System' }]);
  };

  const handleSendMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: Date.now(), senderName: 'Analyst.Me' }]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
      <div className="lg:col-span-2 space-y-6 flex flex-col min-h-0">
        <Card className="bg-red-900/10 border-red-900/50 p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-red-500 uppercase tracking-widest animate-pulse">Critical Incident Status</h2>
            <p className="text-xs text-red-400 mt-1">Active High-Severity Vectors: {criticalThreats.length}</p>
          </div>
          <Button onClick={handleLockdown} variant="danger" className="border-red-500 text-white bg-red-600 hover:bg-red-700">EMERGENCY LOCKDOWN</Button>
        </Card>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <Card className="p-4 border-l-4 border-l-red-500 flex flex-col min-h-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 shrink-0">Critical Targets</h3>
            <div className="overflow-y-auto flex-1 custom-scrollbar space-y-2">
              {criticalThreats.map(t => (
                <div key={t.id} className="pb-2 border-b border-slate-800 last:border-0">
                  <div className="flex justify-between"><span className="text-white font-mono text-xs font-bold">{t.indicator}</span><Badge color="red">{t.score}</Badge></div>
                  <div className="text-[10px] text-slate-500">{t.threatActor}</div>
                </div>
              ))}
              {criticalThreats.length === 0 && <div className="text-slate-600 text-xs italic">No critical threats.</div>}
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-orange-500 flex flex-col min-h-0">
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 shrink-0">Active Operations</h3>
             <div className="overflow-y-auto flex-1 custom-scrollbar space-y-2">
               {criticalCases.map(c => (
                  <div key={c.id} className="pb-2 border-b border-slate-800">
                     <div className="text-white font-bold text-xs">{c.title}</div>
                     <div className="text-[10px] text-slate-500">Assignee: {c.assignee}</div>
                  </div>
               ))}
               {criticalCases.length === 0 && <div className="text-slate-600 text-xs italic">No critical cases.</div>}
             </div>
          </Card>
        </div>
      </div>

      <div className="h-[500px] lg:h-auto">
        <ChatInterface 
          messages={messages} 
          onSend={handleSendMessage} 
          placeholder="Broadcast command..." 
          className="h-full"
        />
      </div>
    </div>
  );
};
export default WarRoom;
