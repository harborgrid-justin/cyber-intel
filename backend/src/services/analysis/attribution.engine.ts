
import { Actor } from '../../models/intelligence';
import { Threat } from '../../models/intelligence';

interface AttributionResult {
  actor: Actor;
  score: number;
  matches: { type: 'INFRA' | 'TTP' | 'TARGET' | 'ORIGIN'; value: string }[];
}

export class AttributionEngine {
  static async calculate(input: string, actors: Actor[]): Promise<AttributionResult[]> {
    const results: AttributionResult[] = [];
    const lowerInput = input.toLowerCase();

    for (const actor of actors) {
      let score = 0;
      const matches: { type: 'INFRA' | 'TTP' | 'TARGET' | 'ORIGIN'; value: string }[] = [];

      // 1. TTP Analysis
      // In a real DB, this would be a join. Assuming Actor model has JSONB columns for now.
      if (actor.targets && Array.isArray(actor.targets)) {
        actor.targets.forEach(t => {
            if (lowerInput.includes(t.toLowerCase())) {
                score += 15;
                matches.push({ type: 'TARGET', value: t });
            }
        });
      }

      if (actor.origin && lowerInput.includes(actor.origin.toLowerCase())) {
          score += 10;
          matches.push({ type: 'ORIGIN', value: actor.origin });
      }

      // 2. Description/Context Matching
      if (actor.description && lowerInput.includes(actor.name.toLowerCase())) {
          score += 50; // Direct mention
          matches.push({ type: 'TTP', value: 'Direct Reference' });
      }

      // 3. Sophistication Heuristic
      if (actor.sophistication === 'Advanced' && (lowerInput.includes('apt') || lowerInput.includes('advanced'))) {
          score += 5;
      }

      if (score > 0) {
        results.push({ actor, score: Math.min(100, score), matches });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }
}
