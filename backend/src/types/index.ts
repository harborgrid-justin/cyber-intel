
export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  clearance: 'TS' | 'SECRET' | 'UNCLASSIFIED';
}

export interface Threat {
  id: string;
  indicator: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  status: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';
  score: number;
  last_seen: Date;
  meta?: Record<string, any>;
}

export interface MitreItem {
  id: string;
  name: string;
  description: string;
  url?: string;
  tactic?: string;
  aliases?: string[];
}

export interface ScannerStatus {
  id?: string;
  name?: string;
  status: string;
  last_scan?: Date;
  coverage?: string;
  findings?: number;
}

// Global declaration removed to prevent conflict with auth.middleware.ts which defines User as Model
// declare global {
//   namespace Express {
//     interface Request {
//       user?: User;
//     }
//   }
// }