
import OpenAI from 'openai';
import { CONFIG } from '@/config';

let aiClient: OpenAI | null = null;
const BRIEFING_CACHE_KEY = 'SENTINEL_BRIEFING_CACHE';

const getAiClient = (): OpenAI | null => {
  if (aiClient) return aiClient;
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    try {
      aiClient = new OpenAI({ 
        apiKey,
        dangerouslyAllowBrowser: true // Required for browser usage
      });
    } catch (error) {
      console.warn('Failed to initialize OpenAI client:', error);
      return null;
    }
  }
  return aiClient;
};

export interface ChatSession {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  sendMessage: (content: string) => Promise<string>;
}

export const createAnalysisChat = (): ChatSession | null => {
  const ai = getAiClient();
  
  // Return a mock chat session if no API key is available
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: CONFIG.AI.SYSTEM_INSTRUCTION,
    },
  ];

  const sendMessage = async (content: string): Promise<string> => {
    if (!ai) {
      return "AI Assistant unavailable: No API key configured. Please set OPENAI_API_KEY to enable AI-powered analysis.";
    }

    messages.push({ role: 'user', content });

    try {
      const response = await ai.chat.completions.create({
        model: CONFIG.AI.MODEL_NAME,
        messages: messages,
        max_tokens: 500,
      });

      const assistantMessage = response.choices[0]?.message?.content || "No response generated.";
      messages.push({ role: 'assistant', content: assistantMessage });
      
      return assistantMessage;
    } catch (error: any) {
      console.error("Chat Error:", error);
      return `Error: ${error?.message || 'Unknown error occurred'}`;
    }
  };

  return { messages, sendMessage };
};

export const generateDailyBriefing = async (): Promise<string> => {
  // 1. Check Local Cache (Prevent rate limits on reload)
  try {
    const cached = localStorage.getItem(BRIEFING_CACHE_KEY);
    if (cached) {
      const { date, text } = JSON.parse(cached);
      // If cached data is from today, use it
      if (date === new Date().toDateString()) {
        return text;
      }
    }
  } catch (e) {
    console.warn("Briefing cache read failed", e);
  }

  const ai = getAiClient();
  if (!ai) {
    return "AI BRIEFING OFFLINE: No API key configured. System monitoring continues via standard threat feeds.";
  }
  
  try {
    const response = await ai.chat.completions.create({
      model: CONFIG.AI.MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: CONFIG.AI.SYSTEM_INSTRUCTION,
        },
        {
          role: 'user',
          content: `Generate a fictional but realistic executive summary of global cyber threats for today. Focus on ransomware and zero-day exploits. Keep it under ${CONFIG.AI.MAX_TOKENS_BRIEFING} words.`,
        },
      ],
      max_tokens: CONFIG.AI.MAX_TOKENS_BRIEFING * 2, // Words to tokens ratio
    });
    
    const text = response.choices[0]?.message?.content || "Unable to generate briefing.";

    // 2. Save to Cache
    localStorage.setItem(BRIEFING_CACHE_KEY, JSON.stringify({
      date: new Date().toDateString(),
      text
    }));

    return text;
  } catch (error: any) {
    console.error("Briefing Error:", error);
    
    // Handle Rate Limiting
    if (
      error?.status === 429 || 
      error?.code === 'rate_limit_exceeded' ||
      error?.message?.includes('429') ||
      error?.message?.includes('quota')
    ) {
      return "INTELLIGENCE FEED LIMITED: Global threat levels remain elevated. Rate limits prevent live update. Monitoring standard channels for Ransomware velocity and CVE exploitation.";
    }

    // Handle Auth Errors
    if (error?.status === 401 || error?.status === 403 || error?.code === 'invalid_api_key') {
      return "ACCESS DENIED: Invalid or missing API Key. Briefing offline.";
    }
    
    return "System offline. Briefing unavailable.";
  }
};
