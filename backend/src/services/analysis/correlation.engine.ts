
import { Threat } from '../../models/intelligence';

interface CorrelationEvent {
  id: string;
  timestamp: string;
  type: string;
  source: string;
  indicator: string;
  severity: string;
  metadata: Record<string, any>;
}

interface CorrelationResult {
  correlationId: string;
  events: CorrelationEvent[];
  correlationType: 'TEMPORAL' | 'SPATIAL' | 'BEHAVIORAL' | 'INDICATOR' | 'CAMPAIGN';
  confidence: number;
  score: number;
  description: string;
  threat_actors?: string[];
  attack_chain?: string[];
}

interface CorrelationRule {
  id: string;
  name: string;
  type: 'SEQUENCE' | 'FREQUENCY' | 'PATTERN' | 'ANOMALY';
  conditions: Array<{ field: string; operator: string; value: any }>;
  timeWindow: number; // in seconds
  threshold: number;
}

export class CorrelationEngine {
  /**
   * Correlate events based on multiple dimensions
   * Identifies relationships between seemingly unrelated security events
   */
  static async correlateEvents(events: CorrelationEvent[]): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    // Temporal correlation - events happening in close time proximity
    results.push(...this.temporalCorrelation(events));

    // Indicator-based correlation - shared IOCs across events
    results.push(...this.indicatorCorrelation(events));

    // Behavioral correlation - similar attack patterns
    results.push(...this.behavioralCorrelation(events));

    // Spatial correlation - events from same geographic region
    results.push(...this.spatialCorrelation(events));

    // Campaign correlation - events part of coordinated attack
    results.push(...this.campaignCorrelation(events));

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Temporal correlation - identify events occurring in time windows
   */
  private static temporalCorrelation(events: CorrelationEvent[]): CorrelationResult[] {
    const results: CorrelationResult[] = [];
    const timeWindow = 3600; // 1 hour in seconds

    // Sort events by timestamp
    const sortedEvents = [...events].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Sliding window to find clustered events
    for (let i = 0; i < sortedEvents.length; i++) {
      const clusterEvents: CorrelationEvent[] = [sortedEvents[i]];
      const baseTime = new Date(sortedEvents[i].timestamp).getTime();

      for (let j = i + 1; j < sortedEvents.length; j++) {
        const eventTime = new Date(sortedEvents[j].timestamp).getTime();
        const timeDiff = (eventTime - baseTime) / 1000;

        if (timeDiff <= timeWindow) {
          clusterEvents.push(sortedEvents[j]);
        } else {
          break; // Events are sorted, so we can break early
        }
      }

      // If we found a cluster of 3+ events, it's significant
      if (clusterEvents.length >= 3) {
        const uniqueSources = new Set(clusterEvents.map(e => e.source)).size;
        const avgSeverity = this.calculateAverageSeverity(clusterEvents);

        results.push({
          correlationId: `TEMP-${Date.now()}-${i}`,
          events: clusterEvents,
          correlationType: 'TEMPORAL',
          confidence: Math.min(0.95, 0.6 + (clusterEvents.length * 0.05)),
          score: clusterEvents.length * 10 + avgSeverity * 5,
          description: `${clusterEvents.length} events detected within ${Math.round(timeWindow / 60)} minutes from ${uniqueSources} sources`,
          attack_chain: this.inferAttackChain(clusterEvents)
        });

        i += clusterEvents.length - 1; // Skip processed events
      }
    }

    return results;
  }

  /**
   * Indicator-based correlation - find shared IOCs
   */
  private static indicatorCorrelation(events: CorrelationEvent[]): CorrelationResult[] {
    const results: CorrelationResult[] = [];
    const indicatorMap = new Map<string, CorrelationEvent[]>();

    // Group events by indicator
    events.forEach(event => {
      const indicator = event.indicator.toLowerCase();
      if (!indicatorMap.has(indicator)) {
        indicatorMap.set(indicator, []);
      }
      indicatorMap.get(indicator)!.push(event);
    });

    // Find indicators that appear in multiple events
    indicatorMap.forEach((eventsForIndicator, indicator) => {
      if (eventsForIndicator.length >= 2) {
        const uniqueSources = new Set(eventsForIndicator.map(e => e.source)).size;
        const timeSpan = this.calculateTimeSpan(eventsForIndicator);

        results.push({
          correlationId: `INDIC-${Date.now()}-${indicator}`,
          events: eventsForIndicator,
          correlationType: 'INDICATOR',
          confidence: Math.min(0.98, 0.7 + (uniqueSources * 0.1)),
          score: eventsForIndicator.length * 15 + uniqueSources * 5,
          description: `IOC "${indicator}" detected across ${eventsForIndicator.length} events from ${uniqueSources} sources over ${timeSpan}`,
          threat_actors: this.identifyPotentialActors(eventsForIndicator)
        });
      }
    });

    return results;
  }

  /**
   * Behavioral correlation - identify similar attack patterns
   */
  private static behavioralCorrelation(events: CorrelationEvent[]): CorrelationResult[] {
    const results: CorrelationResult[] = [];

    // Group events by type and analyze patterns
    const typeGroups = new Map<string, CorrelationEvent[]>();
    events.forEach(event => {
      if (!typeGroups.has(event.type)) {
        typeGroups.set(event.type, []);
      }
      typeGroups.get(event.type)!.push(event);
    });

    // Look for behavioral patterns (e.g., recon -> exploitation -> exfiltration)
    const attackSequences = this.identifyAttackSequences(events);

    attackSequences.forEach(sequence => {
      if (sequence.events.length >= 3) {
        results.push({
          correlationId: `BEHAV-${Date.now()}-${sequence.pattern}`,
          events: sequence.events,
          correlationType: 'BEHAVIORAL',
          confidence: sequence.confidence,
          score: sequence.events.length * 20,
          description: `Attack pattern detected: ${sequence.pattern}`,
          attack_chain: sequence.chain
        });
      }
    });

    return results;
  }

  /**
   * Spatial correlation - events from same geographic region
   */
  private static spatialCorrelation(events: CorrelationEvent[]): CorrelationResult[] {
    const results: CorrelationResult[] = [];
    const regionMap = new Map<string, CorrelationEvent[]>();

    // Group events by region
    events.forEach(event => {
      const region = event.metadata?.region || event.metadata?.country || 'Unknown';
      if (region !== 'Unknown') {
        if (!regionMap.has(region)) {
          regionMap.set(region, []);
        }
        regionMap.get(region)!.push(event);
      }
    });

    // Find regions with multiple events
    regionMap.forEach((eventsForRegion, region) => {
      if (eventsForRegion.length >= 3) {
        const uniqueTypes = new Set(eventsForRegion.map(e => e.type)).size;

        results.push({
          correlationId: `SPATIAL-${Date.now()}-${region}`,
          events: eventsForRegion,
          correlationType: 'SPATIAL',
          confidence: 0.75,
          score: eventsForRegion.length * 8 + uniqueTypes * 3,
          description: `${eventsForRegion.length} events detected from region: ${region} with ${uniqueTypes} different attack types`
        });
      }
    });

    return results;
  }

  /**
   * Campaign correlation - identify coordinated attack campaigns
   */
  private static campaignCorrelation(events: CorrelationEvent[]): CorrelationResult[] {
    const results: CorrelationResult[] = [];

    // Look for patterns that suggest a coordinated campaign:
    // 1. Multiple attack types
    // 2. Sustained over time
    // 3. Shared infrastructure or TTPs
    // 4. Similar targets

    const eventTypes = new Set(events.map(e => e.type));
    const timeSpan = this.calculateTimeSpanInHours(events);
    const uniqueIndicators = new Set(events.map(e => e.indicator));

    // Campaign indicators: multiple attack types, sustained activity, infrastructure reuse
    if (eventTypes.size >= 3 && timeSpan >= 24 && events.length >= 5) {
      const infrastructureReuse = events.length - uniqueIndicators.size;

      if (infrastructureReuse > 0) {
        results.push({
          correlationId: `CAMPAIGN-${Date.now()}`,
          events: events,
          correlationType: 'CAMPAIGN',
          confidence: Math.min(0.92, 0.6 + (eventTypes.size * 0.05) + (infrastructureReuse * 0.02)),
          score: events.length * 25 + eventTypes.size * 10,
          description: `Potential coordinated campaign detected: ${events.length} events over ${Math.round(timeSpan)} hours with ${eventTypes.size} attack types and infrastructure reuse`,
          threat_actors: this.identifyPotentialActors(events),
          attack_chain: this.inferAttackChain(events)
        });
      }
    }

    return results;
  }

  /**
   * Apply custom correlation rules
   */
  static async applyCorrelationRules(
    events: CorrelationEvent[],
    rules: CorrelationRule[]
  ): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    for (const rule of rules) {
      const matchedEvents = this.evaluateRule(events, rule);

      if (matchedEvents.length >= rule.threshold) {
        results.push({
          correlationId: `RULE-${rule.id}-${Date.now()}`,
          events: matchedEvents,
          correlationType: 'BEHAVIORAL',
          confidence: 0.9,
          score: matchedEvents.length * 15,
          description: `Rule matched: ${rule.name} (${matchedEvents.length} events)`,
          attack_chain: this.inferAttackChain(matchedEvents)
        });
      }
    }

    return results;
  }

  /**
   * Real-time correlation for streaming events
   */
  static async correlateStream(
    newEvent: CorrelationEvent,
    recentEvents: CorrelationEvent[],
    timeWindow: number = 3600
  ): Promise<CorrelationResult | null> {
    const cutoffTime = new Date(newEvent.timestamp).getTime() - (timeWindow * 1000);

    // Filter recent events within time window
    const relevantEvents = recentEvents.filter(e =>
      new Date(e.timestamp).getTime() >= cutoffTime
    );

    // Add new event to the pool
    relevantEvents.push(newEvent);

    // Run quick correlation checks
    const correlations = await this.correlateEvents(relevantEvents);

    // Return the most significant correlation involving the new event
    const newEventCorrelation = correlations.find(c =>
      c.events.some(e => e.id === newEvent.id)
    );

    return newEventCorrelation || null;
  }

  /**
   * Graph-based correlation - build relationship graph
   */
  static buildCorrelationGraph(events: CorrelationEvent[]): {
    nodes: Array<{ id: string; type: string; label: string }>;
    edges: Array<{ source: string; target: string; relationship: string; weight: number }>;
  } {
    const nodes: Array<{ id: string; type: string; label: string }> = [];
    const edges: Array<{ source: string; target: string; relationship: string; weight: number }> = [];
    const nodeMap = new Map<string, boolean>();

    // Create nodes for each unique indicator
    events.forEach(event => {
      if (!nodeMap.has(event.indicator)) {
        nodes.push({
          id: event.indicator,
          type: event.type,
          label: `${event.type}: ${event.indicator}`
        });
        nodeMap.set(event.indicator, true);
      }
    });

    // Create edges based on co-occurrence and relationships
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];

        // Calculate relationship strength
        const timeDiff = Math.abs(
          new Date(event1.timestamp).getTime() - new Date(event2.timestamp).getTime()
        ) / 1000;

        if (timeDiff < 7200) { // 2 hours
          const weight = Math.max(1, 100 - (timeDiff / 72)); // Higher weight for closer events

          edges.push({
            source: event1.indicator,
            target: event2.indicator,
            relationship: 'temporal',
            weight
          });
        }
      }
    }

    return { nodes, edges };
  }

  // Helper methods
  private static calculateAverageSeverity(events: CorrelationEvent[]): number {
    const severityMap: Record<string, number> = {
      'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4
    };

    const total = events.reduce((sum, e) =>
      sum + (severityMap[e.severity?.toUpperCase()] || 2), 0
    );

    return total / events.length;
  }

  private static calculateTimeSpan(events: CorrelationEvent[]): string {
    if (events.length === 0) return '0 minutes';

    const times = events.map(e => new Date(e.timestamp).getTime());
    const span = (Math.max(...times) - Math.min(...times)) / 1000;

    if (span < 3600) return `${Math.round(span / 60)} minutes`;
    if (span < 86400) return `${Math.round(span / 3600)} hours`;
    return `${Math.round(span / 86400)} days`;
  }

  private static calculateTimeSpanInHours(events: CorrelationEvent[]): number {
    if (events.length === 0) return 0;

    const times = events.map(e => new Date(e.timestamp).getTime());
    return (Math.max(...times) - Math.min(...times)) / (1000 * 60 * 60);
  }

  private static inferAttackChain(events: CorrelationEvent[]): string[] {
    const chain: string[] = [];
    const killChainMap: Record<string, string> = {
      'Reconnaissance': 'Recon',
      'Weaponization': 'Weaponize',
      'Delivery': 'Deliver',
      'Exploitation': 'Exploit',
      'Installation': 'Install',
      'Command and Control': 'C2',
      'Actions on Objectives': 'Execute'
    };

    // Sort events by timestamp
    const sorted = [...events].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Infer kill chain phases from event types
    sorted.forEach(event => {
      const phase = event.metadata?.killChainPhase || this.mapTypeToKillChain(event.type);
      if (phase && !chain.includes(phase)) {
        chain.push(phase);
      }
    });

    return chain;
  }

  private static mapTypeToKillChain(type: string): string {
    const typeUpper = type.toUpperCase();
    if (typeUpper.includes('SCAN') || typeUpper.includes('RECON')) return 'Reconnaissance';
    if (typeUpper.includes('PHISH') || typeUpper.includes('MALWARE')) return 'Delivery';
    if (typeUpper.includes('EXPLOIT') || typeUpper.includes('CVE')) return 'Exploitation';
    if (typeUpper.includes('C2') || typeUpper.includes('BEACON')) return 'Command and Control';
    if (typeUpper.includes('EXFIL') || typeUpper.includes('DATA')) return 'Actions on Objectives';
    return 'Unknown';
  }

  private static identifyPotentialActors(events: CorrelationEvent[]): string[] {
    const actors = new Set<string>();

    events.forEach(event => {
      if (event.metadata?.threatActor) {
        actors.add(event.metadata.threatActor);
      }
    });

    return Array.from(actors);
  }

  private static identifyAttackSequences(events: CorrelationEvent[]): Array<{
    pattern: string;
    events: CorrelationEvent[];
    confidence: number;
    chain: string[];
  }> {
    const sequences: Array<{
      pattern: string;
      events: CorrelationEvent[];
      confidence: number;
      chain: string[];
    }> = [];

    // Define known attack patterns
    const patterns = [
      {
        name: 'Recon to Exploitation',
        sequence: ['RECON', 'SCAN', 'EXPLOIT'],
        confidence: 0.85
      },
      {
        name: 'Exploitation to C2',
        sequence: ['EXPLOIT', 'C2', 'BEACON'],
        confidence: 0.90
      },
      {
        name: 'Full Kill Chain',
        sequence: ['RECON', 'EXPLOIT', 'C2', 'EXFIL'],
        confidence: 0.95
      }
    ];

    // Match events against patterns
    patterns.forEach(pattern => {
      const matchedEvents = events.filter(e =>
        pattern.sequence.some(p => e.type.toUpperCase().includes(p))
      );

      if (matchedEvents.length >= 2) {
        sequences.push({
          pattern: pattern.name,
          events: matchedEvents,
          confidence: pattern.confidence,
          chain: this.inferAttackChain(matchedEvents)
        });
      }
    });

    return sequences;
  }

  private static evaluateRule(events: CorrelationEvent[], rule: CorrelationRule): CorrelationEvent[] {
    return events.filter(event => {
      return rule.conditions.every(condition => {
        const fieldValue = (event as any)[condition.field] || event.metadata?.[condition.field];

        switch (condition.operator) {
          case 'equals':
            return fieldValue === condition.value;
          case 'contains':
            return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
          case 'greater_than':
            return Number(fieldValue) > Number(condition.value);
          case 'less_than':
            return Number(fieldValue) < Number(condition.value);
          default:
            return false;
        }
      });
    });
  }
}
