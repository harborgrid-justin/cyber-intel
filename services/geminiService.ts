
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { CONFIG } from '../config';

let aiClient: GoogleGenAI | null = null;
const BRIEFING_CACHE_KEY = 'SENTINEL_BRIEFING_CACHE';

const getAiClient = (): GoogleGenAI | null => {
  if (aiClient) return aiClient;
  
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const createAnalysisChat = (): Chat | null => {
  const ai = getAiClient();
  if (!ai) return null;
  
  return ai.chats.create({
    model: CONFIG.AI.MODEL_NAME,
    config: {
      systemInstruction: CONFIG.AI.SYSTEM_INSTRUCTION,
    },
  });
};

export const generateDailyBriefing = async (): Promise<string> => {
  // 1. Check Local Cache (Prevent 429s on reload)
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
  if (!ai) return "API KEY MISSING: Intelligence briefing unavailable.";
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: CONFIG.AI.MODEL_NAME,
      contents: `Generate a fictional but realistic executive summary of global cyber threats for today. Focus on ransomware and zero-day exploits. Keep it under ${CONFIG.AI.MAX_TOKENS_BRIEFING} words.`,
    });
    
    const text = response.text || "Unable to generate briefing.";

    // 2. Save to Cache
    localStorage.setItem(BRIEFING_CACHE_KEY, JSON.stringify({
      date: new Date().toDateString(),
      text
    }));

    return text;
  } catch (error: any) {
    console.error("Briefing Error:", error);
    
    // Handle Rate Limiting (429)
    if (error?.status === 429 || error?.code === 429 || error?.message?.includes('429')) {
      return "INTELLIGENCE FEED LIMITED: Global threat levels remain elevated. Rate limits prevent live update. Monitoring standard channels for Ransomware velocity and CVE exploitation.";
    }

    const err = error as { status?: number | string, message?: string };
    if (err.status === 403 || err.status === 'PERMISSION_DENIED' || err.message?.includes('403')) {
      return "ACCESS DENIED: Restricted permissions or invalid API Key. Briefing offline.";
    }
    return "System offline. Briefing unavailable.";
  }
};
