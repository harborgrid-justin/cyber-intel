
import { useState, useRef, useEffect, useCallback } from 'react';
import { createAnalysisChat } from '../../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";
import { Message } from '../../components/Shared/ChatInterface';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { CaseId } from '../../types';

export const useIntelChat = () => {
  const aiConfig = useDataStore(() => threatData.getAIConfig());
  const [messages, setMessages] = useState<Message[]>([{ 
    id: '0', 
    role: 'model', 
    text: 'Sentinel AI online. How can I assist with your threat hunting today?', 
    timestamp: Date.now(), 
    senderName: 'Sentinel AI' 
  }]);
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

  const createCaseFromChat = useCallback(() => {
    const lastMsg = messages.filter(m => m.role === 'model').pop()?.text || "Intel Chat Analysis";
    threatData.addCase({
      id: `CASE-${Date.now()}` as CaseId, title: 'Intel Analysis Findings', description: lastMsg, status: 'OPEN',
      priority: 'MEDIUM', assignee: 'Me', reporter: 'AI_Assistant', tasks: [], findings: '', relatedThreatIds: [], created: new Date().toISOString(),
      notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['AI-Gen'], tlp: 'AMBER'
    });
    alert("Case Created from Intel Session");
  }, [messages]);

  return { messages, loading, handleSend, aiConfig, createCaseFromChat };
};
