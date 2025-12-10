
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createAnalysisChat } from '../../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";
import { threatData } from '../../services/dataLayer';
import { StandardPage } from '../Shared/Layouts';
import { Card, Button, CardHeader, Badge } from '../Shared/UI';
import ChatInterface, { Message } from '../Shared/ChatInterface';
import AttributionEngine from './AttributionEngine';
import { IntelTools } from './Views/IntelTools';
import { TriageView } from './Views/TriageView';
import { CaseId, View } from '../../types';
import { useDataStore } from '../../hooks';

const IntelAssistant: React.FC = () => {
  const modules = useDataStore(() => threatData.getModulesForView(View.ANALYSIS));
  const aiConfig = useDataStore(() => threatData.getAIConfig());
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [messages, setMessages] = useState<Message[]>([{ id: '0', role: 'model', text: 'Sentinel AI online. How can I assist with your threat hunting today?', timestamp: Date.now(), senderName: 'Sentinel AI' }]);
  const [loading, setLoading] = useState(false);
  const chatSession = useRef<Chat | null>(null);

  useEffect(() => { 
      try {
        chatSession.current = createAnalysisChat(); 
      } catch (e) {
        console.warn("AI Client init failed, defaulting to offline mode.");
      }
  }, []);

  const getSimulatedResponse = (text: string): string => {
      const lower = text.toLowerCase();
      if (lower.includes('ransomware') || lower.includes('lockbit')) {
          return "ANALYSIS: Ransomware activity detected matching LockBit 3.0 signatures. \n\nRECOMMENDATION:\n1. Isolate affected subnets immediately.\n2. Verify backup integrity.\n3. Reset domain admin credentials.";
      }
      if (lower.includes('ip') || lower.includes('192.168')) {
          return "LOOKUP RESULT: The IP address is associated with known C2 infrastructure (APT-29). \n\nConfidence: High (95%)\nLast Seen: 2 hours ago via Firewall Logs.";
      }
      return "I've logged this query. Unable to connect to the central knowledge base for a live generative response, but I have flagged this artifact for manual review.";
  };

  const handleSend = useCallback(async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text, timestamp: Date.now(), senderName: 'Me' };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    
    try {
        let responseText = "No Data";
        if (chatSession.current) {
            const result: GenerateContentResponse = await chatSession.current.sendMessage({ message: userMsg.text });
            responseText = result.text || "No Data";
        } else {
            await new Promise(r => setTimeout(r, 1500)); 
            responseText = getSimulatedResponse(userMsg.text);
        }
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now(), senderName: 'Sentinel AI' }]);
    } catch (err) { 
      const offlineResponse = getSimulatedResponse(userMsg.text);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: `[OFFLINE MODE] ${offlineResponse}`, timestamp: Date.now(), senderName: 'Sentinel AI' }]);
    } finally { 
        setLoading(false); 
    }
  }, []);

  const handleCreateCase = () => {
    const lastMsg = messages.filter(m => m.role === 'model').pop()?.text || "Intel Chat Analysis";
    threatData.addCase({
      id: `CASE-${Date.now()}` as CaseId, title: 'Intel Analysis Findings', description: lastMsg, status: 'OPEN',
      priority: 'MEDIUM', assignee: 'Me', reporter: 'AI_Assistant', tasks: [], findings: '', relatedThreatIds: [], created: new Date().toLocaleDateString(),
      notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['AI-Gen'], tlp: 'AMBER'
    });
    alert("Case Created from Intel Session");
  };

  return (
    <StandardPage
      title="AI Threat Analyst"
      subtitle={`Powered by ${aiConfig.modelName}`}
      actions={<Button onClick={handleCreateCase}>Create Case from Session</Button>}
      modules={modules}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      {activeModule === 'Chat' && (
        <Card className="flex-1 flex flex-col min-h-0 p-0 border-slate-800 h-full overflow-hidden">
          <CardHeader title="AI Analyst Session" action={<Badge color="purple">{aiConfig.modelName.toUpperCase()}</Badge>} />
          <ChatInterface messages={messages} onSend={handleSend} isLoading={loading} placeholder="Query threat intelligence..." className="flex-1 border-0 rounded-none h-full bg-slate-900/50" />
        </Card>
      )}
      
      {activeModule === 'Attribution' && <AttributionEngine />}
      
      {activeModule === 'Triage' && <TriageView />}
      
      {['Decryption', 'Translation', 'Summary'].includes(activeModule) && <IntelTools />}

      {!['Chat', 'Attribution', 'Triage', 'Decryption', 'Translation', 'Summary'].includes(activeModule) && (
        <Card className="flex-1 flex items-center justify-center text-slate-500 uppercase tracking-widest p-12">
          {activeModule} Module Interface
        </Card>
      )}
    </StandardPage>
  );
};
export default IntelAssistant;
