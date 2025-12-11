
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { threatData } from './dataLayer';
import { Case } from '../types';

let aiClient: GoogleGenAI | null = null;
const BRIEFING_CACHE_KEY = 'SENTINEL_BRIEFING_CACHE';

const getAiClient = (): GoogleGenAI | null => {
  if (aiClient) return aiClient;
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
  } else {
    console.warn("[GeminiService] API_KEY not found in process.env");
  }
  return aiClient;
};

export const createAnalysisChat = (): Chat | null => {
  const ai = getAiClient();
  const config = threatData.getAIConfig();
  if (!ai) return null;
  return ai.chats.create({
    model: config.modelName,
    config: { systemInstruction: config.systemInstruction },
  });
};

export const generateDailyBriefing = async (): Promise<string> => {
  try {
    const cached = localStorage.getItem(BRIEFING_CACHE_KEY);
    if (cached) {
      const { date, text } = JSON.parse(cached);
      if (date === new Date().toDateString()) return text;
    }
  } catch (e) { 
    console.error("[GeminiService] Cache read failed", e); 
  }

  const ai = getAiClient();
  const config = threatData.getAIConfig();
  
  if (!ai) {
    console.error("[GeminiService] Client not initialized (Missing API Key)");
    return "API KEY MISSING: Intelligence briefing unavailable.";
  }
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a fictional, realistic executive cyber threat summary for today. Focus on ransomware. Max ${config.maxTokensBriefing} words.`,
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("Received empty response text from Gemini API");
    }

    localStorage.setItem(BRIEFING_CACHE_KEY, JSON.stringify({ date: new Date().toDateString(), text }));
    return text;
  } catch (error) { 
    console.error("[GeminiService] generateDailyBriefing failed:", error);
    return `System offline. Briefing unavailable. Error: ${(error as Error).message}`; 
  }
};

export const generateCaseReport = async (kase: Case, type: string): Promise<string> => {
  const ai = getAiClient();
  const config = threatData.getAIConfig();
  if (!ai) {
      console.error("[GeminiService] Client not initialized (Missing API Key)");
      return "Error: API Key missing. Cannot generate report.";
  }

  const prompt = `
    ACT AS: Cyber Incident Commander.
    TASK: Write a ${type} Report for the following security incident.
    CASE TITLE: ${kase.title}
    SEVERITY: ${kase.priority}
    STATUS: ${kase.status}
    DETAILS: ${kase.description}
    AGENCY: ${kase.agency}
    
    REQUIREMENTS:
    - Use professional, military-grade brevity.
    - Include a "Strategic Assessment" section.
    - Include a "Recommended Actions" section.
    - Output in Markdown format.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
        return "Analysis generation returned empty result.";
    }
    return text;
  } catch (e) {
    console.error("[GeminiService] generateCaseReport failed:", e);
    return `Error generating report: ${(e as Error).message}`;
  }
};
