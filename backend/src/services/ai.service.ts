
import { GoogleGenAI } from "@google/genai";
import { AuditService } from './audit.service';
import { VectorService } from './vector.service';
import { logger } from '../utils/logger';

const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const vectorService = new VectorService();

/**
 * Prompt Templates for Threat Intelligence Analysis
 */
export const PromptTemplates = {
  threatAnalysis: (data: any) => `Analyze the following threat intelligence and provide:
1. Threat classification and severity
2. Potential impact assessment
3. Recommended mitigation strategies
4. Attribution confidence if applicable

Data: ${JSON.stringify(data, null, 2)}`,

  incidentSummary: (incident: any) => `Generate a concise executive summary of this security incident:
- Timeline of events
- Systems/assets affected
- Actions taken
- Current status
- Recommendations

Incident Data: ${JSON.stringify(incident, null, 2)}`,

  iocEnrichment: (ioc: string, iocType: string) => `Enrich this ${iocType} indicator: ${ioc}
Provide:
- Known associations (threat actors, campaigns)
- Historical context
- Risk score justification
- Detection recommendations`,

  threatHunting: (hypothesis: string, data: any) => `Evaluate this threat hunting hypothesis:
Hypothesis: ${hypothesis}

Data: ${JSON.stringify(data, null, 2)}

Provide:
- Evidence supporting/refuting hypothesis
- Additional data points to investigate
- Recommended hunting queries
- Priority assessment`,

  reportGeneration: (findings: any[], reportType: string) => `Generate a ${reportType} report based on these findings:

${findings.map((f, i) => `Finding ${i + 1}: ${JSON.stringify(f, null, 2)}`).join('\n\n')}

Include:
- Executive summary
- Technical details
- Risk assessment
- Recommendations
- Next steps`,

  ruleCreation: (description: string, examples: any[]) => `Create detection rules for: ${description}

Examples of malicious activity:
${examples.map((e, i) => `Example ${i + 1}: ${JSON.stringify(e, null, 2)}`).join('\n\n')}

Provide:
- Sigma/YARA rule
- Detection logic explanation
- False positive considerations
- Tuning recommendations`,

  attribution: (indicators: any[], ttps: string[]) => `Perform threat actor attribution analysis:

Indicators:
${JSON.stringify(indicators, null, 2)}

TTPs observed:
${ttps.join(', ')}

Provide:
- Likely threat actor(s)
- Confidence level with reasoning
- Similar past campaigns
- Strategic recommendations`,

  vulnerabilityAssessment: (cve: string, context: any) => `Assess vulnerability ${cve} in our environment:

Context: ${JSON.stringify(context, null, 2)}

Provide:
- Exploit likelihood
- Business impact
- Prioritization (P0-P5)
- Remediation steps
- Compensating controls if patching delayed`
};

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

  /**
   * Generate threat analysis using template
   */
  static async analyzeThreat(data: any, userId: string) {
    const prompt = PromptTemplates.threatAnalysis(data);
    return this.generateAnalysis(prompt, '', userId);
  }

  /**
   * Generate incident summary
   */
  static async summarizeIncident(incident: any, userId: string) {
    const prompt = PromptTemplates.incidentSummary(incident);
    return this.generateAnalysis(prompt, '', userId);
  }

  /**
   * Enrich IOC with AI-powered intelligence
   */
  static async enrichIOC(ioc: string, iocType: string, userId: string) {
    const prompt = PromptTemplates.iocEnrichment(ioc, iocType);
    return this.generateAnalysis(prompt, '', userId);
  }

  /**
   * AI-powered threat hunting
   */
  static async evaluateHuntingHypothesis(hypothesis: string, data: any, userId: string) {
    const prompt = PromptTemplates.threatHunting(hypothesis, data);
    return this.generateAnalysis(prompt, '', userId);
  }

  /**
   * Generate comprehensive report
   */
  static async generateReport(findings: any[], reportType: string, userId: string) {
    const prompt = PromptTemplates.reportGeneration(findings, reportType);
    return this.generateAnalysis(prompt, '', userId);
  }

  /**
   * Generate detection rules
   */
  static async createDetectionRule(description: string, examples: any[], userId: string) {
    const prompt = PromptTemplates.ruleCreation(description, examples);
    return this.generateAnalysis(prompt, '', userId);
  }

  /**
   * Perform attribution analysis
   */
  static async performAttribution(indicators: any[], ttps: string[], userId: string) {
    const prompt = PromptTemplates.attribution(indicators, ttps);
    return this.generateAnalysis(prompt, '', userId);
  }

  /**
   * Assess vulnerability impact
   */
  static async assessVulnerability(cve: string, context: any, userId: string) {
    const prompt = PromptTemplates.vulnerabilityAssessment(cve, context);
    return this.generateAnalysis(prompt, '', userId);
  }

  /**
   * Multi-step analysis with chain of thought
   */
  static async chainOfThoughtAnalysis(steps: string[], context: any, userId: string) {
    const results: any[] = [];
    let accumulatedContext = JSON.stringify(context);

    for (let i = 0; i < steps.length; i++) {
      const stepPrompt = `Step ${i + 1} of ${steps.length}: ${steps[i]}\n\nPrevious analysis: ${accumulatedContext}`;
      const result = await this.generateAnalysis(stepPrompt, '', userId);
      results.push({ step: i + 1, task: steps[i], result: result.text });
      accumulatedContext += `\n\nStep ${i + 1} Result: ${result.text}`;
    }

    return {
      steps: results,
      finalAnalysis: results[results.length - 1].result,
      ragHits: results.reduce((sum, r) => sum + (r.ragHits || 0), 0)
    };
  }

  /**
   * Batch processing for multiple items
   */
  static async batchAnalysis(items: any[], templateFn: (item: any) => string, userId: string, concurrency: number = 3) {
    const results: any[] = [];

    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(item => this.generateAnalysis(templateFn(item), '', userId))
      );
      results.push(...batchResults);
    }

    return results;
  }
}
