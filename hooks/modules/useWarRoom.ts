
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Threat, Case, Severity } from '../../types';
import { useWakeLock } from '../useWakeLock';
import { IncidentLogic } from '../../services/logic/IncidentLogic';
import { Message } from '../../components/Shared/ChatInterface';

export const useWarRoom = (threats: Threat[], cases: Case[]) => {
  const [activeTab, setActiveTab] = useState<'STATUS' | 'MAP' | 'COMMS'>('STATUS');
  const [showLockdown, setShowLockdown] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Use custom hook for Wake Lock to prevent screen sleep during ops
  const { active: wakeLockActive, requestLock, releaseLock } = useWakeLock(); 
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'system', text: 'ENCRYPTED CHANNEL ESTABLISHED [TS/SCI]', timestamp: Date.now(), senderName: 'SysAdmin' },
    { id: '2', role: 'model', text: 'Awaiting SITREP...', timestamp: Date.now(), senderName: 'Sentinel AI' }
  ]);

  // Timer effect with cleanup
  useEffect(() => {
    requestLock(); 
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => { 
      clearInterval(timer); 
      releaseLock(); 
    };
  }, [requestLock, releaseLock]);

  // Memoized data derived from props
  const criticalThreats = useMemo(() => {
    return threats.filter(t => t.severity === Severity.CRITICAL);
  }, [threats]);

  const metrics = useMemo(() => IncidentLogic.calculateMetrics(cases), [cases]);

  // Message Handler
  const handleSendMessage = useCallback((text: string) => {
    const newMessage: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        text, 
        timestamp: Date.now(), 
        senderName: 'Cmd. Connor' 
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // System Action Handler
  const addSystemMessage = useCallback((text: string) => {
      setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'system', 
          text, 
          timestamp: Date.now() 
      }]);
  }, []);

  return {
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
  };
};
