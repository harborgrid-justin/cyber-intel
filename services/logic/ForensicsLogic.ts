
import { Artifact, ChainEvent, Malware, Device } from '../../types';
import { apiClient } from '../apiClient';

export class ForensicsLogic {
  static async verifyArtifactIntegrity(artifact: Artifact): Promise<{ valid: boolean; timestamp: string }> {
    try {
      return await apiClient.post('/analysis/forensics/verify', { id: artifact.id, status: artifact.status });
    } catch {
      return { valid: false, timestamp: new Date().toISOString() };
    }
  }

  static async calculateStorageProjection(artifacts: Artifact[]): Promise<{ totalGB: number; cost: number; retentionRisk: number }> {
    try {
      return await apiClient.get<any>('/analysis/lifecycle/storage/projection');
    } catch {
      // Fallback
      const totalGB = artifacts.reduce((acc, a) => acc + (parseFloat(a.size) || 0) / 1024, 0);
      const hotTierCost = totalGB * 0.23; 
      const oldArtifacts = artifacts.filter(a => (Date.now() - new Date(a.uploadDate).getTime()) > (365 * 86400000)).length;
      return { 
          totalGB: parseFloat(totalGB.toFixed(2)), 
          cost: parseFloat(hotTierCost.toFixed(2)),
          retentionRisk: oldArtifacts 
      };
    }
  }

  static async validateCustodyChain(chain: ChainEvent[]): Promise<{ intact: boolean; lastCustodian: string }> {
    try {
      return await apiClient.post('/analysis/forensics/custody', { events: chain });
    } catch {
      return { intact: false, lastCustodian: 'Unknown (API Error)' };
    }
  }

  static async assessMalwareRisk(sample: Malware): Promise<number> {
    try {
      return await apiClient.post<number>('/analysis/forensics/malware-risk', { sample });
    } catch {
      return 50; // Safe fallback
    }
  }

  static async suggestDeviceAction(device: Device): Promise<string> {
    try {
      return await apiClient.post<string>('/analysis/forensics/device-action', { device });
    } catch {
      return 'MANUAL REVIEW';
    }
  }
}
