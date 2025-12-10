
export interface UnifiedLog {
  id: string;
  timestamp: string;
  severity: string;
  message: string;
  source: string;
}

// Adaptee 1: Splunk
export interface SplunkResult {
  _time: string;
  _raw: string;
  host: string;
  sourcetype: string;
}

// Adaptee 2: Elastic
export interface ElasticHit {
  _id: string;
  _source: {
    '@timestamp': string;
    message: string;
    log: { level: string };
    host: { name: string };
  }
}

export class SiemAdapter {
  static fromSplunk(result: SplunkResult): UnifiedLog {
    return {
      id: `splunk-${Date.now()}-${Math.random()}`,
      timestamp: result._time,
      severity: 'UNKNOWN', // Splunk raw often lacks explicit level unless parsed
      message: result._raw,
      source: `Splunk:${result.host}`
    };
  }

  static fromElastic(hit: ElasticHit): UnifiedLog {
    return {
      id: hit._id,
      timestamp: hit._source['@timestamp'],
      severity: hit._source.log?.level || 'INFO',
      message: hit._source.message,
      source: `Elastic:${hit._source.host?.name}`
    };
  }
}
