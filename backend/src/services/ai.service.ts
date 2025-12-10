
import { GoogleGenAI } from "@google/genai";
import { AuditService } from './audit.service';
import { VectorService } from './vector.service';
import { logger } from '../utils/logger';

const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const vectorService = new VectorService();

export class AiService {
  
  static async generateAnalysis(prompt: string, context: string = '', userId: string) {
    try {
      const model = 'gemini-2.5-flash';
      
      // 1. RAG Retrieval
      logger.info(`[RAG] Searching vector DB for context: "${prompt.substring(0, 50)}..."`);
      const vectorResults = await vectorService.query(prompt, 3);
      
      let augmentedContext = context;
      
      if (vectorResults.length > 0) {
        const ragContent = vectorResults.map(r => `[REF: ${r.metadata.source || 'KnowledgeBase'} | Score: ${r.score.toFixed(2)}]\n${r.content}`).join('\n\n');
        augmentedContext += `\n\n=== RELEVANT INTELLIGENCE (RAG) ===\n${ragContent}\n==================================\n`;
        logger.info(`[RAG] Augmented prompt with ${vectorResults.length} relevant documents.`);
      }

      const systemInstruction = `You are a Tier 3 Cyber Threat Analyst for the Sentinel Platform.
      Use the provided Context and Relevant Intelligence (RAG) to answer the user's request.
      If the RAG data is relevant, cite it using [REF].
      Provide technical, concise, and actionable intelligence.`;
      
      const response = await aiClient.models.generateContent({
        model,
        contents: `CONTEXT: ${augmentedContext}\n\nTASK: ${prompt}`,
        config: { systemInstruction }
      });

      const text = response.text || "Analysis unavailable.";
      
      await AuditService.log(userId, 'AI_QUERY', `Generated analysis using ${model} with RAG (${vectorResults.length} docs)`);
      
      return { text, model, ragHits: vectorResults.length };
    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error("AI Processing Failed");
    }
  }
}
