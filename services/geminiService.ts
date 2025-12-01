
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { CONFIG } from '../config';

let aiClient: GoogleGenAI | null = null;

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
  const ai = getAiClient();
  if (!ai) return "API KEY MISSING: Intelligence briefing unavailable.";
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: CONFIG.AI.MODEL_NAME,
      contents: `Generate a fictional but realistic executive summary of global cyber threats for today. Focus on ransomware and zero-day exploits. Keep it under ${CONFIG.AI.MAX_TOKENS_BRIEFING} words.`,
    });
    return response.text || "Unable to generate briefing.";
  } catch (error: unknown) {
    console.error("Briefing Error:", error);
    const err = error as { status?: number | string, message?: string };
    if (err.status === 403 || err.status === 'PERMISSION_DENIED' || err.message?.includes('403')) {
      return "ACCESS DENIED: Restricted permissions or invalid API Key. Briefing offline.";
    }
    return "System offline. Briefing unavailable.";
  }
};
