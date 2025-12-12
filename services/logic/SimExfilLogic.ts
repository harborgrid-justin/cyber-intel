
import { SystemNode } from '../../types';
import { ExfilConfig } from '../../types/simulation';
import { apiClient } from '../apiClient';

// Re-export for convenience
export type { ExfilConfig };

export interface ExfilPhysicsResult {
  totalSize: string;
  overheadPct: string;
  duration: string; // Pre-formatted string from backend
  durationSeconds?: number; // Raw seconds if needed logic side
  throughput: string;
  detectionScore: number;
  packets: number;
}

export class SimExfilLogic {
  
  static getProtocolOptions() {
    return ['DNS', 'HTTPS', 'ICMP', 'FTP', 'SMB'];
  }

  static async calculatePhysics(node: SystemNode, config: ExfilConfig): Promise<ExfilPhysicsResult> {
    try {
      return await apiClient.post<ExfilPhysicsResult>('/simulation/exfil', { nodeId: node.id, config });
    } catch {
      // Offline Fallback
      return {
        totalSize: 'Unknown (Offline)',
        overheadPct: '0%',
        duration: 'Unknown',
        throughput: '0 Mbps',
        detectionScore: 50,
        packets: 0
      };
    }
  }
  
  static formatDuration(seconds: number): string {
    if (seconds === Infinity) return 'Blocked';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
    return `${(seconds / 86400).toFixed(1)} days`;
  }
}
