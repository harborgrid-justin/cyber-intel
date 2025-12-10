
import { ActorId } from './opaque';

export interface ExfilConfig {
    protocol: 'DNS' | 'HTTPS' | 'ICMP' | 'FTP' | 'SMB';
    encryption: 'NONE' | 'AES' | 'XOR';
    chunkSize: number;
    jitter: number;
    bandwidthLimit: number;
}

export interface ExfilPhysicsResult {
  totalSize: string;
  overheadPct: string;
  duration: string;
  durationSeconds?: number;
  throughput: string;
  detectionScore: number;
  packets: number;
}

export interface TTPDef {
  id: string;
  name: string;
  stage: string;
  noise: number;
  cost: number;
  baseSuccess: number;
  mitreId: string;
  desc: string;
  requires?: string[];
  synergy?: string[];
}

export interface CampaignStep { uuid: string; ttpId: string; config?: any; }
export interface SimulationPath { path: string[]; prob: number; }

export interface AttackStep {
    id: string;
    stage: string;
    node: string;
    method: string;
    successProbability: number;
    description: string;
    detectionRisk: number;
}

export interface AttackPath {
    actorId: ActorId;
    entryPoint: string;
    steps: AttackStep[];
    estimatedTime: string;
    criticalAssetCompromised: boolean;
    totalDetectionProbability: number;
}

export interface PatchPrioritization {
    vulnId: string;
    assetId: string;
    score: number;
    reason: string;
    cvss: number;
    businessCriticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ResponsePlan {
    id: string;
    name: string;
    targetNodes: string[];
    type: 'ISOLATION' | 'PATCH' | 'BLOCK_IP';
    collateralDamageScore: number;
    businessImpact: string[];
    successRate: number;
    status: 'DRAFT' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
    requiredAuth?: 'ELEVATION_REQUIRED' | 'Authorized';
}

export interface IntegrationMetric {
  id: number;
  name: string;
  status: 'CRITICAL' | 'WARNING' | 'ACTIVE' | 'MITIGATING' | 'SECURE' | 'IDLE' | 'MONITORING';
  value: string;
  icon: string;
}

export interface VulnerabilityScan {
    id: string;
    target: string;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
    findings: number;
    progress: number;
    startTime: string;
}

export interface SlaStatus {
  status: 'ON_TRACK' | 'WARNING' | 'BREACHED';
  daysRemaining: number;
  dueDate: string;
}

export interface DecoyRecommendation { nodeId: string; reason: string; score: number; }
export interface SegmentationResult { blockedCount: number; affectedServices: string[]; }
export interface LateralPath { path: string[]; risk: number; details: string; }
