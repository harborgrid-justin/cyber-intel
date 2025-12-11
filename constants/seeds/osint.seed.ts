
import { OsintDomain, OsintBreach, OsintSocial, OsintGeo, MitreItem, RiskForecastItem, OsintDarkWebItem, OsintFileMeta } from '../../types';

export const MOCK_DOMAIN: OsintDomain[] = [ { id: 'd1', domain: 'evil.com', registrar: 'BadHost', created: '2023-10', expires: '2024-10', dns: '1.2.3.4', status: 'Active', subdomains: ['mail.'], ssl: 'Valid' } ];
export const MOCK_BREACH: OsintBreach[] = [ { id: 'br1', email: 's.connor@sentinel.local', breach: 'LinkedIn', date: '2016', data: 'Password (Hash)', source: 'Leak' } ];
export const MOCK_SOCIAL: OsintSocial[] = [ { id: 'soc1', handle: '@threatintel', platform: 'Twitter', status: 'Active', followers: 1200, lastPost: '2h ago', sentiment: 'Negative', bio: 'Security Researcher' } ];
export const MOCK_GEO: OsintGeo[] = [ { id: 'geo1', ip: '185.200.1.1', city: 'Moscow', country: 'RU', isp: 'Telia', asn: 'AS1234', coords: '55,37', ports: [80, 443], threatScore: 85 } ];
export const MOCK_DARKWEB: OsintDarkWebItem[] = [ { id: 'dw1', source: 'RaidForums', title: 'Sentinel Corp DB Leak', date: '2023-10-20', author: 'ThreatBot', status: 'Verified', price: '$500' } ];
export const MOCK_META: OsintFileMeta[] = [ { id: 'meta-1', name: 'invoice.pdf', size: '1MB', type: 'PDF', author: 'Unknown', created: '2023-01-01', gps: 'None' } ];


export const MOCK_TACTICS: MitreItem[] = [ { id: 'TA0001', name: 'Initial Access', description: 'The adversary is trying to get into your network.' } ];
export const MOCK_TECHNIQUES: MitreItem[] = [ { id: 'T1566', name: 'Phishing', tactic: 'Initial Access', description: 'Sends emails with malicious links.' } ];
export const MOCK_SUB_TECHNIQUES: MitreItem[] = [ { id: 'T1566.001', name: 'Spearphishing Attachment', parent: 'T1566', description: 'Phishing with attachment.' } ];
export const MOCK_GROUPS: MitreItem[] = [ { id: 'G0007', name: 'APT28', aliases: ['Fancy Bear'], description: 'Russian GRU.' } ];
export const MOCK_SOFTWARE: MitreItem[] = [ { id: 'S0002', name: 'Mimikatz', type: 'Tool', description: 'Credential dumper.' } ];
export const MOCK_MITIGATIONS: MitreItem[] = [ { id: 'M1050', name: 'Exploit Protection', description: 'Use ASLR and DEP.' } ];

export const MOCK_RISK_FORECAST: RiskForecastItem[] = [ 
    { id: 'rf1', day: 'Today', risk: 3, label: 'High' }, 
    { id: 'rf2', day: '+1', risk: 4, label: 'Critical' },
    { id: 'rf3', day: '+2', risk: 4, label: 'Critical' },
    { id: 'rf4', day: '+3', risk: 2, label: 'Elevated' },
    { id: 'rf5', day: '+4', risk: 1, label: 'Low' },
    { id: 'rf6', day: '+5', risk: 2, label: 'Elevated' },
    { id: 'rf7', day: '+6', risk: 3, label: 'High' }
];
