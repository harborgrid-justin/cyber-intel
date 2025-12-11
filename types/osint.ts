
import { Threat, Case, ThreatActor } from './intelligence';
import { UserId } from './opaque';
import { Vendor } from './infrastructure';
import { IncidentReport } from './operations';

export interface OsintDomain {
    id: string;
    domain: string;
    registrar: string;
    created: string;
    expires: string;
    dns: string;
    status: 'Active' | 'Expired';
    subdomains: string[];
    ssl: 'Valid' | 'Invalid' | 'None';
}

export interface OsintBreach {
    id: string;
    email: string;
    breach: string;
    date: string;
    data: string;
    hash?: string;
    source?: string;
}

export interface OsintSocial {
    id: string;
    handle: string;
    platform: string;
    status: string;
    followers: number;
    lastPost: string;
    sentiment: string;
    bio: string;
    priorityScore?: number;
}

export interface OsintGeo {
    id: string;
    ip: string;
    city: string;
    country: string;
    isp: string;
    asn: string;
    coords: string;
    ports: number[];
    threatScore: number;
}

export interface OsintDarkWebItem {
    id: string;
    source: string;
    title: string;
    date: string;
    author: string;
    status: 'Verified' | 'Unverified';
    price: string;
    trend?: 'UP' | 'DOWN' | 'STABLE';
    severity?: 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface OsintFileMeta {
    id: string;
    name: string;
    size: string;
    type: string;
    author: string;
    created: string;
    gps: string;
}

export interface VIPProfile {
    userId: UserId;
    name: string;
    title?: string;
    doxxingProb: number;
    phishingSusceptibility: number;
    exposedCreds: number;
    sentiment: 'Neutral' | 'Negative' | 'Hostile';
    recentMentions: number;
}

export type SearchResultType = 'THREAT' | 'CASE' | 'ACTOR' | 'VENDOR' | 'REPORT';

export type GlobalSearchResult = 
    | { type: 'THREAT', val: Threat }
    | { type: 'CASE', val: Case }
    | { type: 'ACTOR', val: ThreatActor }
    | { type: 'VENDOR', val: Vendor }
    | { type: 'REPORT', val: IncidentReport };

export interface DomainAnalysis {
    dnsSecurity: { score: number; hasSpf: boolean; hasDmarc: boolean; riskLevel: string; };
    typosquats: string[];
    registrarRisk: number;
}

export interface IdentityAnalysis {
    botProbability: number;
    influence: { score: number; label: string; };
}

export interface CredentialExposure { score: number; types: string[]; }
export interface NetworkAnalysis { classification: string; portRisk: number; isProxy: boolean; threatContext: string; }
export interface DarkWebAnalysis { trend: 'UP' | 'DOWN' | 'STABLE'; markup: number; severity: 'MEDIUM' | 'HIGH' | 'CRITICAL'; }
