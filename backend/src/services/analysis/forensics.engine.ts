
interface CustodyEvent {
  timestamp?: string;
  date?: string;
  action: string;
  user_id?: string;
  user?: string;
  notes?: string;
}

interface MalwareSample {
  score?: number;
  family?: string;
  verdict?: string;
  hash?: string;
}

interface DeviceContext {
  status: string;
  missedPatches?: number;
  type: string;
  custodian: string;
}

export class ForensicsEngine {
  static verifyArtifactIntegrity(_artifactId: string, status: string): { valid: boolean; timestamp: string } {
    // In prod, this would re-hash the file on storage and compare with DB hash
    const valid = status !== 'COMPROMISED';
    return { valid, timestamp: new Date().toISOString() };
  }

  static validateCustodyChain(events: CustodyEvent[]): { intact: boolean; lastCustodian: string } {
    const sorted = [...events].sort((a, b) => new Date(a.timestamp || a.date || 0).getTime() - new Date(b.timestamp || b.date || 0).getTime());
    let currentHolder = 'SECURE_STORAGE';
    let intact = true;

    sorted.forEach(e => {
        if (e.action === 'CHECK_OUT') {
            if (currentHolder !== 'SECURE_STORAGE') intact = false;
            currentHolder = e.user_id || e.user || 'Unknown';
        } else if (e.action === 'CHECK_IN') {
            currentHolder = 'SECURE_STORAGE';
        } else if (e.action === 'TRANSFER') {
            const match = (e.notes || '').match(/to\s+(\w+)/);
            currentHolder = match ? match[1] : 'Unknown';
        }
    });
    return { intact, lastCustodian: currentHolder };
  }

  static assessMalwareRisk(sample: MalwareSample): number {
    let risk = sample.score || 0;
    // Logic from ForensicsLogic
    if (sample.family?.includes('Ransom') || sample.family?.includes('LockBit')) risk += 20;
    if (sample.verdict === 'MALICIOUS') risk += 10;
    if (sample.hash && sample.hash.startsWith('00')) risk += 50; // Mock high-value heuristic
    return Math.min(100, risk);
  }

  static suggestDeviceAction(device: DeviceContext): string {
    // Logic from ForensicsLogic
    if (device.status === 'QUARANTINED') return 'SANITIZE';
    if ((device.missedPatches || 0) > 5) return 'UPDATE';
    if (device.type === 'Mobile' && device.custodian === 'Unknown') return 'WIPE';
    return 'MAINTAIN';
  }
}
