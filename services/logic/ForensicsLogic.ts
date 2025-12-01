
import { Artifact, ChainEvent, Malware, Device } from '../../types';

export class ForensicsLogic {
  static verifyArtifactIntegrity(artifact: Artifact): { valid: boolean; timestamp: string } {
    // Logic: Checks if current hash matches original hash (simulated)
    const valid = !artifact.status || artifact.status !== 'COMPROMISED';
    return { valid, timestamp: new Date().toISOString() };
  }

  static calculateStorageProjection(artifacts: Artifact[]): { totalGB: number; cost: number; retentionRisk: number } {
    const totalGB = artifacts.reduce((acc, a) => acc + (parseFloat(a.size) || 0) / 1024, 0);
    const hotTierCost = totalGB * 0.23; // $0.23 per GB
    const oldArtifacts = artifacts.filter(a => (Date.now() - new Date(a.uploadDate).getTime()) > (365 * 86400000)).length;
    return { 
        totalGB: parseFloat(totalGB.toFixed(2)), 
        cost: parseFloat(hotTierCost.toFixed(2)),
        retentionRisk: oldArtifacts 
    };
  }

  static validateCustodyChain(chain: ChainEvent[]): { intact: boolean; lastCustodian: string } {
    const sorted = [...chain].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentHolder = 'SECURE_STORAGE';
    let intact = true;

    sorted.forEach(e => {
        if (e.action === 'CHECK_OUT') {
            if (currentHolder !== 'SECURE_STORAGE') intact = false; // Double checkout
            currentHolder = e.user;
        } else if (e.action === 'CHECK_IN') {
            currentHolder = 'SECURE_STORAGE';
        } else if (e.action === 'TRANSFER') {
            currentHolder = e.notes.split('to ')[1] || 'Unknown';
        }
    });
    return { intact, lastCustodian: currentHolder };
  }

  static assessMalwareRisk(sample: Malware): number {
    let risk = sample.score;
    if (sample.family.includes('Ransom')) risk += 20;
    if (sample.verdict === 'MALICIOUS') risk += 10;
    return Math.min(100, risk);
  }

  static suggestDeviceAction(device: Device): string {
    if (device.status === 'QUARANTINED') return 'SANITIZE';
    if ((device.missedPatches || 0) > 5) return 'UPDATE';
    return 'MAINTAIN';
  }
}
