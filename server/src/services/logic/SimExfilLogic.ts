
import { SystemNode, ExfilConfig } from '@/types';

const PROTOCOLS = {
  'DNS': { overhead: 0.65, baseSpeed: 0.05, stealthBase: 0.95, detectionRate: 0.1 }, 
  'HTTPS': { overhead: 0.10, baseSpeed: 0.90, stealthBase: 0.80, detectionRate: 0.3 }, 
  'ICMP': { overhead: 0.25, baseSpeed: 0.15, stealthBase: 0.40, detectionRate: 0.7 }, 
  'FTP': { overhead: 0.02, baseSpeed: 1.00, stealthBase: 0.10, detectionRate: 0.9 }, 
  'SMB': { overhead: 0.15, baseSpeed: 0.85, stealthBase: 0.30, detectionRate: 0.6 } 
};

const ENCRYPTION = {
  'NONE': { sizeMult: 1.0, entropy: 0.4 },
  'AES': { sizeMult: 1.01, entropy: 0.9 }, 
  'XOR': { sizeMult: 1.0, entropy: 0.6 }
};

export class SimExfilLogic {
  
  static getProtocolOptions() {
    return Object.keys(PROTOCOLS);
  }

  static calculatePhysics(node: SystemNode, config: ExfilConfig) {
    const proto = PROTOCOLS[config.protocol];
    const enc = ENCRYPTION[config.encryption];

    // 1. Volume Physics
    const rawVolumeMB = node.dataVolumeGB * 1024;
    const overheadMultiplier = 1 + proto.overhead + (config.protocol === 'DNS' ? 0.33 : 0); 
    const totalTransmissionMB = rawVolumeMB * enc.sizeMult * overheadMultiplier;

    // 2. Speed & Time
    const jitterPenalty = config.jitter * 0.4;
    const effectiveMbps = config.bandwidthLimit * proto.baseSpeed * (1 - jitterPenalty);
    
    const totalBits = totalTransmissionMB * 8 * 1024 * 1024;
    const speedBps = effectiveMbps * 1024 * 1024;
    const seconds = totalBits / speedBps;

    // 3. Detection Physics
    let detectionScore = proto.detectionRate * 100;
    
    if (config.protocol === 'DNS' && node.dataVolumeGB > 0.1) detectionScore += 50;
    if (config.protocol !== 'HTTPS' && enc.entropy > 0.8) detectionScore += 30; 
    
    if (node.securityControls.includes('DLP')) {
       if (config.encryption === 'NONE') detectionScore += 40; 
       if (config.protocol === 'HTTPS') detectionScore -= 20; 
    }

    if (node.securityControls.includes('FIREWALL')) {
        if (['FTP', 'SMB'].includes(config.protocol)) detectionScore = 100;
    }

    return {
      totalSize: (totalTransmissionMB / 1024).toFixed(2) + ' GB',
      overheadPct: Math.round((overheadMultiplier - 1) * 100) + '%',
      duration: this.formatDuration(seconds),
      throughput: effectiveMbps.toFixed(2) + ' Mbps',
      detectionScore: Math.min(100, Math.round(detectionScore)),
      packets: Math.ceil((totalTransmissionMB * 1024) / config.chunkSize).toLocaleString()
    };
  }

  static formatDuration(seconds: number): string {
    if (seconds === Infinity) return 'Blocked';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
    return `${(seconds / 86400).toFixed(1)} days`;
  }

  static analyzeExfilScenario(node: SystemNode) {
    const defaultConfig: ExfilConfig = {
        protocol: node.securityControls.includes('FIREWALL') ? 'HTTPS' : 'FTP',
        encryption: 'AES',
        chunkSize: 64,
        jitter: 0.1,
        bandwidthLimit: 100
    };
    const physics = this.calculatePhysics(node, defaultConfig);
    
    return {
      protocol: defaultConfig.protocol,
      compressedSize: physics.totalSize,
      estimatedTime: physics.duration,
      stealthScore: 100 - physics.detectionScore,
      dlpDetectionRisk: physics.detectionScore,
      alertStatus: physics.detectionScore > 80 ? 'DETECTED' : physics.detectionScore > 50 ? 'SUSPICIOUS' : 'UNDETECTED'
    };
  }
}