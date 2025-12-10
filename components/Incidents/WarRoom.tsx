
import React, { useMemo } from 'react';
import { Threat, Case } from '../../types';
import { Button, CardHeader, HeaderContainer } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { useWarRoom } from '../../hooks/modules/useWarRoom';
import ChatInterface from '../Shared/ChatInterface';
import GeoMap from '../Dashboard/GeoMap';
import Modal from '../Shared/Modal';

interface WarRoomProps { 
  threats: Threat[]; 
  cases: Case[]; 
  onUpdate: () => void; 
}

const StatusTicker = React.memo(() => {
  const logs = threatData.getAuditLogs().slice(0, 5);
  return (
    <div className="bg-slate-950 border-b border-slate-800 py-1 overflow-hidden whitespace-nowrap flex items-center gap-4 shrink-0">
      <div className="text-[10px] font-bold text-red-500 px-4 animate-pulse">LIVE FEED</div>
      <div className="inline-block animate-[marquee_20s_linear_infinite] text-[10px] font-mono text-cyan-500/80">
        {logs.map((l, i) => <span key={l.id || i} className="mx-4">[{l.timestamp}] {l.action} :: {l.user} ({l.details})</span>)}
      </div>
    </div>
  );
});

const WarRoom: React.FC<WarRoomProps> = ({ threats, cases, onUpdate }) => {
  const {
    activeTab,
    setActiveTab,
    showLockdown,
    setShowLockdown,
    isLocked,
    setIsLocked,
    currentTime,
    wakeLockActive,
    messages,
    handleSendMessage,
    addSystemMessage,
    criticalThreats,
    metrics
  } = useWarRoom(threats, cases);

  const activeResponders = useMemo(() => threatData.getSystemUsers().filter(u => u.status === 'Online').length, []);

  const handleLockdown = () => {
    setIsLocked(true);
    setShowLockdown(false);
    
    // Perform lockdown logic safely
    criticalThreats.forEach(t => {
        try {
            threatData.updateStatus(t.id, 'CONTAINED' as any);
        } catch (e) {
            console.error(`Failed to update threat ${t.id}`, e);
        }
    });

    addSystemMessage('*** EMERGENCY LOCKDOWN PROTOCOL ACTIVATED ***\nAll external gateways severed.\nAuth tokens revoked.');
    onUpdate();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden">
      <Modal isOpen={showLockdown} onClose={() => setShowLockdown(false)} title="CONFIRM LOCKDOWN">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <p className="text-slate-300 text-sm">This will sever all external connections and revoke active sessions for non-admin users. This action is logged.</p>
          <div className="flex gap-2 w-full">
            <Button onClick={handleLockdown} variant="danger" className="w-full justify-center bg-red-600 hover:bg-red-700 text-white">EXECUTE PROTOCOL</Button>
            <Button onClick={() => setShowLockdown(false)} variant="secondary" className="w-full justify-center">ABORT</Button>
          </div>
        </div>
      </Modal>

      <HeaderContainer className="px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
            <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${isLocked ? 'bg-red-600 animate-ping' : 'bg-green-500'}`}></span>
                Strategic Operations
            </h2>
            <div className="flex gap-4 mt-1 text-[10px] font-mono text-slate-500">
                <span>ZULU: {currentTime.toISOString().split('T')[1].split('.')[0]}Z</span>
                <span className="hidden md:inline">|</span>
                <span>RESPONDERS: {activeResponders} ACTIVE</span>
                <span className="hidden md:inline">|</span>
                <span className={wakeLockActive ? 'text-green-500' : 'text-slate-600'}>{wakeLockActive ? 'DISPLAY LOCKED' : 'NO WAKE LOCK'}</span>
            </div>
            </div>
            <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded text-[10px] font-bold border ${isLocked ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {isLocked ? 'SYSTEM LOCKED' : 'SECURE'}
            </div>
            <Button onClick={() => setShowLockdown(true)} variant="danger" className="text-[10px] py-1 border-red-500/50">
                {isLocked ? 'RESTORE ACCESS' : 'INITIATE LOCKDOWN'}
            </Button>
            </div>
        </div>
      </HeaderContainer>

      <StatusTicker />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className={`md:w-1/4 bg-slate-900 border-r border-slate-800 flex flex-col transition-all ${activeTab === 'STATUS' ? 'flex' : 'hidden md:flex'} h-full overflow-hidden`}>
           <div className="flex-1 flex flex-col min-h-0">
             <CardHeader title="SITREP Summary" className="bg-slate-950" />
             <div className="p-4 grid grid-cols-2 gap-4 border-b border-slate-800">
                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center"><div className="text-[9px] text-slate-500 uppercase">Criticals</div><div className="text-xl text-red-500 font-bold">{criticalThreats.length}</div></div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center"><div className="text-[9px] text-slate-500 uppercase">Dwell Time</div><div className="text-xl text-orange-500 font-bold">{metrics.dwellTime}</div></div>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
               {criticalThreats.map(t => (
                 <div key={t.id} className="p-3 bg-red-900/5 border border-red-900/20 rounded hover:bg-red-900/10 cursor-pointer transition-colors group">
                   <div className="flex justify-between items-start mb-1">
                     <span className="text-red-400 font-mono text-xs font-bold">{t.indicator}</span>
                     <span className="text-[9px] text-red-500/70 group-hover:text-red-400">{t.score}</span>
                   </div>
                   <div className="text-[10px] text-slate-400 truncate">{t.description}</div>
                 </div>
               ))}
             </div>
           </div>
        </div>
        <div className={`flex-1 bg-slate-950 relative flex flex-col ${activeTab === 'MAP' ? 'flex' : 'hidden md:flex'}`}>
           <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Global Signal</div>
              <div className="text-xl font-mono text-cyan-400">{threats.length} <span className="text-xs text-slate-500">SIG</span></div>
           </div>
           <GeoMap threats={threats} />
        </div>
        <div className={`md:w-1/4 bg-slate-900 border-l border-slate-800 flex flex-col ${activeTab === 'COMMS' ? 'flex' : 'hidden md:flex'} h-full`}>
           <CardHeader title="Command Channel" className="bg-slate-950" />
           <ChatInterface messages={messages} onSend={handleSendMessage} className="flex-1 border-0 rounded-none bg-transparent" placeholder="Broadcast order..." userRole="user" />
        </div>
      </div>
    </div>
  );
};
export default WarRoom;
