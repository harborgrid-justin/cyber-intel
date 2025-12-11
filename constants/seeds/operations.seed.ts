
import { Playbook, ChainEvent, Malware, ForensicJob, Device, Pcap, IncidentReport, ReportSection, VendorFeedItem, EnrichmentModule, ParserRule, NormalizationRule, SegmentationPolicy, Honeytoken, TrafficFlow, OsintDarkWebItem, OsintFileMeta } from '../../types';

export const MOCK_PLAYBOOKS: Playbook[] = [ { id: 'pb1', name: 'Phishing Response', description: 'Standard procedure.', tasks: ['Analyze Email', 'Block Domain', 'Reset Creds'], triggerLabel: 'Phishing', riskLevel: 'LOW' } ];
export const MOCK_AUDIT_LOGS: any[] = [ { id: 'L-1001', action: 'LOGIN_SUCCESS', user: 'admin.connor', timestamp: new Date(Date.now() - 360000).toISOString(), details: 'MFA Verified', location: '10.0.0.5' } ];
export const MOCK_INCIDENT_REPORTS: IncidentReport[] = [ { id: 'RPT-884', title: 'Weekly Threat Briefing', type: 'Executive', date: '2023-10-27', author: 'System', status: 'READY', content: '...' } ];
export const MOCK_CHAIN: ChainEvent[] = [ { id: 'c1', date: '2023-10-27 08:30', artifactId: 'a1', artifactName: 'payload.bin', action: 'CHECK_IN', user: 'Doe', notes: 'Recovered' } ];
export const MOCK_MALWARE: Malware[] = [ { id: 'm1', name: 'invoice.exe', family: 'LockBit', hash: 'e3b0c442...', verdict: 'MALICIOUS', score: 100, associatedActor: 'LockBit' } ];
export const MOCK_LAB_JOBS: ForensicJob[] = [ { id: 'j1', type: 'Disk Imaging', target: 'Server-01', status: 'PROCESSING', progress: 45, technician: 'Stark' } ];
export const MOCK_DEVICES: Device[] = [ { id: 'd1', name: 'CEO iPhone', type: 'Mobile', serial: 'SN-9988', custodian: 'Vault', status: 'SECURE' } ];
export const MOCK_PCAPS: Pcap[] = [ { id: 'p1', name: 'beacon.pcap', size: '15MB', date: '2023-10-27', source: 'FW', protocol: 'TCP', analysisStatus: 'ANALYZED', associatedActor: 'APT-29' } ];
export const MOCK_VENDOR_FEEDS: VendorFeedItem[] = [ { id: 'v1', vendor: 'Microsoft', date: '2023-10-25', title: 'Security Update', severity: 'High' } ];
export const MOCK_ENRICHMENT: EnrichmentModule[] = [ { id: 'e1', name: 'GeoIP', type: 'GEO', provider: 'MaxMind', costPerRequest: 0.0001, latencyMs: 5, enabled: true } ];
export const MOCK_PARSERS: ParserRule[] = [ { id: 'p1', name: 'Apache Log', sourceType: 'Web Server', pattern: '([\\d.]+)', sampleLog: '192.168.1.50 - - "GET /"', status: 'ACTIVE', performance: 'FAST' } ];
export const MOCK_NORMALIZATION: NormalizationRule[] = [ { id: 'n1', sourceField: 'c-ip', targetField: 'client.ip', transform: 'NONE', validation: 'VALID' } ];
export const MOCK_POLICIES: SegmentationPolicy[] = [ { id: 'pol-1', name: 'Isolate DB', source: '*', destination: 'PROD-DB', port: '5432', action: 'DENY', status: 'ACTIVE' } ];
export const MOCK_HONEYTOKENS: Honeytoken[] = [ { id: 'h1', name: 'aws_keys.txt', type: 'FILE', location: 'S3-Public', status: 'ACTIVE', effectiveness: 85 } ];
export const MOCK_TRAFFIC_FLOWS: TrafficFlow[] = [ { id: 'fl-1', source: '192.168.1.5', dest: '10.0.0.50', port: '5432', allowed: true, timestamp: '10:00:01' } ];
export const MOCK_DARKWEB: OsintDarkWebItem[] = [ { id: 'dw1', source: 'RaidForums', title: 'DB Leak', date: '2023', author: 'God', status: 'Verified', price: '$500' } ];
export const MOCK_META: OsintFileMeta[] = [ { id: 'meta-1', name: 'invoice.pdf', size: '1MB', type: 'PDF', author: 'Unknown', created: '2023', gps: 'None' } ];
