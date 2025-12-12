/**
 * Data Enrichment Pipelines
 *
 * Time Complexity: O(n) per enrichment step
 * Space Complexity: O(n)
 *
 * Use Cases:
 * - Enriching IOCs with threat intelligence
 * - Adding context to alerts
 * - Augmenting data with external sources
 * - Entity resolution and linking
 */

export interface EnrichmentResult<T> {
  original: T;
  enriched: T;
  sources: string[];
  confidence: number;
  timestamp: Date;
}

export interface EnrichmentPipeline<T> {
  name: string;
  steps: EnrichmentStep<T>[];
  failFast?: boolean;
}

export interface EnrichmentStep<T> {
  name: string;
  enrich: (data: T) => Promise<Partial<T>>;
  required?: boolean;
  timeout?: number;
}

export class Enrichment {
  /**
   * Apply enrichment pipeline
   */
  async applyPipeline<T>(
    data: T,
    pipeline: EnrichmentPipeline<T>
  ): Promise<EnrichmentResult<T>> {
    const original = { ...data } as T;
    let enriched = { ...data } as T;
    const sources: string[] = [];
    let totalConfidence = 0;
    let successfulSteps = 0;

    for (const step of pipeline.steps) {
      try {
        const result = await this.executeStep(step, enriched);
        enriched = { ...enriched, ...result };
        sources.push(step.name);
        successfulSteps++;
        totalConfidence += 1;
      } catch (error) {
        if (step.required || pipeline.failFast) {
          throw new Error(`Required enrichment step '${step.name}' failed: ${error}`);
        }
      }
    }

    const confidence = pipeline.steps.length > 0 ? totalConfidence / pipeline.steps.length : 0;

    return {
      original,
      enriched,
      sources,
      confidence,
      timestamp: new Date()
    };
  }

  /**
   * Batch enrichment
   */
  async enrichBatch<T>(
    items: T[],
    pipeline: EnrichmentPipeline<T>,
    concurrency: number = 5
  ): Promise<EnrichmentResult<T>[]> {
    const results: EnrichmentResult<T>[] = [];

    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(item => this.applyPipeline(item, pipeline))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Conditional enrichment
   */
  async conditionalEnrich<T>(
    data: T,
    condition: (data: T) => boolean,
    enrichmentFn: (data: T) => Promise<Partial<T>>
  ): Promise<T> {
    if (condition(data)) {
      const enrichment = await enrichmentFn(data);
      return { ...data, ...enrichment };
    }
    return data;
  }

  /**
   * Merge enrichments from multiple sources
   */
  mergeEnrichments<T>(
    base: T,
    enrichments: Array<Partial<T>>,
    priorityFn?: (key: string, values: any[]) => any
  ): T {
    const result = { ...base };

    for (const enrichment of enrichments) {
      for (const [key, value] of Object.entries(enrichment)) {
        if (value === undefined || value === null) continue;

        if (priorityFn && (result as any)[key] !== undefined) {
          const values = [(result as any)[key], value];
          (result as any)[key] = priorityFn(key, values);
        } else {
          (result as any)[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Entity linking and resolution
   */
  linkEntities<T>(
    items: T[],
    getEntityId: (item: T) => string,
    similarityFn: (a: T, b: T) => number,
    threshold: number = 0.8
  ): Map<string, T[]> {
    const entities = new Map<string, T[]>();
    const processed = new Set<number>();

    for (let i = 0; i < items.length; i++) {
      if (processed.has(i)) continue;

      const entityId = getEntityId(items[i]);
      const linkedItems: T[] = [items[i]];
      processed.add(i);

      for (let j = i + 1; j < items.length; j++) {
        if (processed.has(j)) continue;

        const similarity = similarityFn(items[i], items[j]);
        if (similarity >= threshold) {
          linkedItems.push(items[j]);
          processed.add(j);
        }
      }

      entities.set(entityId, linkedItems);
    }

    return entities;
  }

  /**
   * Temporal enrichment (add time-based context)
   */
  addTemporalContext<T extends { timestamp?: Date }>(
    data: T,
    historicalData: T[],
    windowSize: number = 86400000 // 24 hours
  ): T & { context: { recent: T[]; trend: string; frequency: number } } {
    if (!data.timestamp) {
      return { ...data, context: { recent: [], trend: 'unknown', frequency: 0 } };
    }

    const windowStart = new Date(data.timestamp.getTime() - windowSize);
    const recent = historicalData.filter(
      item => item.timestamp && item.timestamp >= windowStart && item.timestamp < data.timestamp
    );

    // Calculate trend
    const halfWindow = windowSize / 2;
    const midPoint = new Date(windowStart.getTime() + halfWindow);
    const firstHalf = recent.filter(item => item.timestamp! < midPoint);
    const secondHalf = recent.filter(item => item.timestamp! >= midPoint);

    let trend = 'stable';
    if (secondHalf.length > firstHalf.length * 1.2) {
      trend = 'increasing';
    } else if (secondHalf.length < firstHalf.length * 0.8) {
      trend = 'decreasing';
    }

    return {
      ...data,
      context: {
        recent,
        trend,
        frequency: recent.length
      }
    };
  }

  /**
   * Geolocation enrichment
   */
  addGeolocation<T extends { ip?: string }>(
    data: T,
    geoLookup: (ip: string) => Promise<{ country: string; city: string; lat: number; lon: number }>
  ): Promise<T & { geo?: any }> {
    if (!data.ip) {
      return Promise.resolve(data as T & { geo?: any });
    }

    return geoLookup(data.ip)
      .then(geo => ({ ...data, geo }))
      .catch(() => data as T & { geo?: any });
  }

  /**
   * Reputation enrichment
   */
  addReputation<T extends { indicator?: string }>(
    data: T,
    reputationSources: Array<{
      name: string;
      check: (indicator: string) => Promise<{ score: number; category?: string }>;
    }>
  ): Promise<T & { reputation?: any }> {
    if (!data.indicator) {
      return Promise.resolve(data as T & { reputation?: any });
    }

    const checks = reputationSources.map(async source => {
      try {
        const result = await source.check(data.indicator!);
        return { source: source.name, ...result };
      } catch {
        return null;
      }
    });

    return Promise.all(checks).then(results => {
      const validResults = results.filter(r => r !== null);
      const avgScore = validResults.length > 0
        ? validResults.reduce((sum, r) => sum + r!.score, 0) / validResults.length
        : 0;

      return {
        ...data,
        reputation: {
          score: avgScore,
          sources: validResults,
          count: validResults.length
        }
      };
    });
  }

  private async executeStep<T>(
    step: EnrichmentStep<T>,
    data: T
  ): Promise<Partial<T>> {
    if (step.timeout) {
      return Promise.race([
        step.enrich(data),
        new Promise<Partial<T>>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), step.timeout)
        )
      ]);
    }

    return step.enrich(data);
  }
}
