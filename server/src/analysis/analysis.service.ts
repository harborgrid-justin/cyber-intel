import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AnalysisService {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async chat(message: string, history: any[] = []) {
    if (!this.openai) {
      return {
        response: 'AI service unavailable. Please configure OPENAI_API_KEY.',
      };
    }

    try {
      const messages = [
        {
          role: 'system' as const,
          content:
            'You are an elite Cyber Threat Intelligence Analyst. Be specific, technical, and concise. Analyze IOCs, TTPs, and provide risk assessments.',
        },
        ...history,
        { role: 'user' as const, content: message },
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
      });

      return {
        response: response.choices[0]?.message?.content || 'No response generated.',
      };
    } catch (error: any) {
      return {
        response: `Error: ${error?.message || 'Unknown error occurred'}`,
      };
    }
  }

  async generateBriefing() {
    if (!this.openai) {
      return {
        briefing: 'AI BRIEFING OFFLINE: No API key configured. System monitoring continues via standard threat feeds.',
      };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an elite Cyber Threat Intelligence Analyst. Be specific, technical, and concise. Analyze IOCs, TTPs, and provide risk assessments.',
          },
          {
            role: 'user',
            content:
              'Generate a fictional but realistic executive summary of global cyber threats for today. Focus on ransomware and zero-day exploits. Keep it under 150 words.',
          },
        ],
        max_tokens: 300,
      });

      return {
        briefing: response.choices[0]?.message?.content || 'Unable to generate briefing.',
      };
    } catch (error: any) {
      if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
        return {
          briefing:
            'INTELLIGENCE FEED LIMITED: Global threat levels remain elevated. Rate limits prevent live update. Monitoring standard channels for Ransomware velocity and CVE exploitation.',
        };
      }
      return {
        briefing: 'System offline. Briefing unavailable.',
      };
    }
  }
}
