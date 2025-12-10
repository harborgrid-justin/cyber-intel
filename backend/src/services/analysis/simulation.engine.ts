
import { Asset } from '../../models/infrastructure';
import { Actor } from '../../models/intelligence';

export class SimulationEngine {
  
  static calculateEvasion(actor: Actor, node: Asset): { score: number; breakdown: any[] } {
    let evasionScore = 0.1; 
    const techniques = actor.evasion_techniques || [];
    
    // Check security controls from the updated Asset model
    const controls = node.security_controls || [];
    
    if (controls.includes('EDR')) {
        if (techniques.includes('Anti-VM') || techniques.includes('Rootkit')) evasionScore += 0.3;
        else evasionScore -= 0.2;
    } else {
        evasionScore += 0.4;
    }

    // AV Bypass
    if (controls.includes('AV')) {
        if (techniques.includes('Packers') || techniques.includes('Fileless Malware')) evasionScore += 0.4;
        else evasionScore -= 0.1;
    }

    const score = Math.min(0.95, Math.max(0.05, evasionScore));
    return {
        score,
        breakdown: [
            { control: 'EDR / Endpoint', score: (score * 0.9) * 100 },
            { control: 'Network / IDS', score: (score * 0.7) * 100 }
        ]
    };
  }

  static calculateExfilPhysics(node: Asset, config: any) {
    const PROTOCOLS: Record<string, any> = {
      'DNS': { overhead: 0.65, baseSpeed: 0.05, detectionRate: 0.1 }, 
      'HTTPS': { overhead: 0.10, baseSpeed: 0.90, detectionRate: 0.3 }, 
      'FTP': { overhead: 0.02, baseSpeed: 1.00, detectionRate: 0.9 }
    };

    const proto = PROTOCOLS[config.protocol] || PROTOCOLS['HTTPS'];
    
    // Use enhanced asset data
    const rawVolumeMB = (node.data_volume_gb || 50) * 1024;
    const overheadMultiplier = 1 + proto.overhead; 
    const totalTransmissionMB = rawVolumeMB * overheadMultiplier;

    const jitterPenalty = config.jitter * 0.4;
    const effectiveMbps = config.bandwidthLimit * proto.baseSpeed * (1 - jitterPenalty);
    
    const totalBits = totalTransmissionMB * 8 * 1024 * 1024;
    const speedBps = effectiveMbps * 1024 * 1024;
    const seconds = totalBits / speedBps;

    let detectionScore = proto.detectionRate * 100;
    if (config.encryption === 'NONE') detectionScore += 40;

    return {
      totalSize: (totalTransmissionMB / 1024).toFixed(2) + ' GB',
      overheadPct: Math.round((overheadMultiplier - 1) * 100) + '%',
      durationSeconds: seconds,
      throughput: effectiveMbps.toFixed(2) + ' Mbps',
      detectionScore: Math.min(100, Math.round(detectionScore)),
      packets: Math.ceil((totalTransmissionMB * 1024) / config.chunkSize)
    };
  }
}
