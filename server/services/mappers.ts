
import { DataMapper } from './dataMapper';
import { Threat, Case, ThreatActor, IncidentStatus, Severity, ForensicJob, ParserRule, EnrichmentModule, NormalizationRule } from '../src/types';
import { DataStandardizer } from './utils/standardizer';
import { calculateThreatScore } from './scoringEngine';

export class ThreatMapper implements DataMapper<Threat> {
  toDomain(raw: any): Threat {
    const severity = DataStandardizer.normalizeEnum(raw.severity, Object.values(Severity), Severity.MEDIUM);
    const confidence = raw.confidence || 50;
    const reputation = raw.reputation || 50;
    
    return {
      id: raw.id || DataStandardizer.generateId('THREAT'),
      indicator: DataStandardizer.sanitizeString(raw.indicator),
      type: raw.type || 'Unknown',
      severity,
      lastSeen: DataStandardizer.toIsoDate(raw.lastSeen),
      source: raw.source || 'Manual',
      description: raw.description || '',
      status: DataStandardizer.normalizeEnum(raw.status, Object.values(IncidentStatus), IncidentStatus.NEW),
      confidence,
      region: raw.region || 'Global',
      threatActor: raw.threatActor || 'Unknown',
      reputation,
      score: raw.score ?? calculateThreatScore(confidence, reputation, severity),
      tlp: raw.tlp,
      sanctioned: !!raw.sanctioned,
      mlRetrain: !!raw.mlRetrain,
      tags: DataStandardizer.ensureArray(raw.tags),
      origin: raw.origin
    };
  }

  toPersistence(domain: Threat): any {
    return domain;
  }
}

export class CaseMapper implements DataMapper<Case> {
  toDomain(raw: any): Case {
    return {
      ...raw,
      id: raw.id || DataStandardizer.generateId('CASE'),
      tasks: DataStandardizer.ensureArray(raw.tasks),
      notes: DataStandardizer.ensureArray(raw.notes),
      artifacts: DataStandardizer.ensureArray(raw.artifacts),
      timeline: DataStandardizer.ensureArray(raw.timeline),
      relatedThreatIds: DataStandardizer.ensureArray(raw.relatedThreatIds),
      sharedWith: DataStandardizer.ensureArray(raw.sharedWith),
      labels: DataStandardizer.ensureArray(raw.labels),
      linkedCaseIds: DataStandardizer.ensureArray(raw.linkedCaseIds),
      created: DataStandardizer.toIsoDate(raw.created),
      status: raw.status || 'OPEN',
      priority: raw.priority || 'MEDIUM'
    };
  }

  toPersistence(domain: Case): any {
    return domain;
  }
}

export class ActorMapper implements DataMapper<ThreatActor> {
  toDomain(raw: any): ThreatActor {
    return {
      ...raw,
      id: raw.id || DataStandardizer.generateId('ACTOR'),
      aliases: DataStandardizer.ensureArray(raw.aliases),
      targets: DataStandardizer.ensureArray(raw.targets),
      ttps: DataStandardizer.ensureArray(raw.ttps),
      campaigns: DataStandardizer.ensureArray(raw.campaigns),
      infrastructure: DataStandardizer.ensureArray(raw.infrastructure),
      exploits: DataStandardizer.ensureArray(raw.exploits),
      references: DataStandardizer.ensureArray(raw.references),
      history: DataStandardizer.ensureArray(raw.history),
      evasionTechniques: DataStandardizer.ensureArray(raw.evasionTechniques)
    };
  }

  toPersistence(domain: ThreatActor): any {
    return domain;
  }
}

export class DetectionMapper implements DataMapper<any> {
  toDomain(raw: any): any {
    return raw;
  }

  toPersistence(domain: any): any {
    return domain;
  }
}

export class FeedMapper implements DataMapper<any> {
  toDomain(raw: any): any {
    return raw;
  }

  toPersistence(domain: any): any {
    return domain;
  }
}
