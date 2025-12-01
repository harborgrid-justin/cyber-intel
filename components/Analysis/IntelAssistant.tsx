
import React, { useState, useRef, useEffect } from 'react';
import { createAnalysisChat } from '../../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";
import { threatData } from '../../services/dataLayer';
import { StandardPage } from '../Shared/Layouts';
import { Card, Button } from '../Shared/UI';
import { CONFIG } from '../../config';
import ChatInterface, { Message } from '../Shared/ChatInterface';
import AttributionEngine from './AttributionEngine';

const IntelAssistant: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.INTEL_ASSISTANT[0]);
  const [messages, setMessages] = useState<Message[]>([{ id: '0', role: 'model', text: 'Sentinel AI online. How can I assist with your threat hunting today?', timestamp: Date.now(), senderName: 'Sentinel AI' }]);
  const [loading, setLoading] = useState(false);
  const chatSession = useRef<Chat | null>(null);

  useEffect(() => { chatSession.current = createAnalysisChat(); }, []);

  const handleSend = async (text: string) => {
    if (!chatSession.current) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text, timestamp: Date.now(), senderName: 'Me' };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
        const result: GenerateContentResponse = await chatSession.current.sendMessage({ message: userMsg.text });
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: result.text || "No Data", timestamp: Date.now(), senderName: 'Sentinel AI' }]);
    } catch (err) { 
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'system', text: "Error connecting to AI service.", timestamp: Date.now() }]);
    } finally { setLoading(false); }
  };

  const handleCreateCase = () => {
    const lastMsg = messages.filter(m => m.role === 'model').pop()?.text || "Intel Chat Analysis";
    threatData.addCase({
      id: `CASE-${Date.now()}`, title: 'Intel Analysis Findings', description: lastMsg, status: 'OPEN',
      priority: 'MEDIUM', assignee: 'Me', reporter: 'AI_Assistant', tasks: [], findings: '', relatedThreatIds: [], created: new Date().toLocaleDateString(),
      notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['AI-Gen'], tlp: 'AMBER'
    });
    alert("Case Created from Intel Session");
  };

  return (
    <StandardPage
      title="AI Threat Analyst"
      subtitle={`Powered by ${CONFIG.AI.MODEL_NAME}`}
      actions={<Button onClick={handleCreateCase}>Create Case from Session</Button>}
      modules={CONFIG.MODULES.INTEL_ASSISTANT}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      {activeModule === 'Chat' && (
        <Card className="flex-1 flex flex-col min-h-0 p-0 border-slate-800 h-full">
          <ChatInterface 
            messages={messages}
            onSend={handleSend}
            isLoading={loading}
            placeholder="Query threat intelligence..."
            className="flex-1 border-0 rounded-none h-full"
          />
        </Card>
      )}
      
      {activeModule === 'Attribution' && <AttributionEngine />}

      {!['Chat', 'Attribution'].includes(activeModule) && (
        <Card className="flex-1 flex items-center justify-center text-slate-500 uppercase tracking-widest p-12">
          {activeModule} Module Interface
        </Card>
      )}
    </StandardPage>
  );
};
export default IntelAssistant;
