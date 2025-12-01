
import { SystemNode, Pcap } from '@/types';

export class HealthLogic {
  static predictNodeFailure(node: SystemNode): { risk: number, prediction: string } {
    let risk = 0;
    if (node.load > 90) risk += 50;
    if (node.latency > 200) risk += 30;
    if (node.status === 'DEGRADED') risk += 20;
    
    let prediction = 'Stable';
    if (risk > 80) prediction = 'Critical Failure Imminent (< 1h)';
    else if (risk > 50) prediction = 'Performance Degradation Likely';
    
    return { risk, prediction };
  }

  static calculateSystemUptime(nodes: SystemNode[]): number {
    const total = nodes.length;
    if (total === 0) return 100;
    const down = nodes.filter(n => n.status === 'OFFLINE').length;
    const degraded = nodes.filter(n => n.status === 'DEGRADED').length;
    // Weighted uptime
    return ((total - down - (degraded * 0.5)) / total) * 100;
  }
}

export class NetworkOpsLogic {
  static analyzeTrafficPatterns(pcaps: Pcap[]): { protocol: string, count: number, volumeMB: number }[] {
    const stats: Record<string, { count: number, vol: number }> = {};
    pcaps.forEach(p => {
      const size = parseFloat(p.size.replace('MB', '')) || 0;
      if (!stats[p.protocol]) stats[p.protocol] = { count: 0, vol: 0 };
      stats[p.protocol].count++;
      stats[p.protocol].vol += size;
    });
    return Object.keys(stats).map(k => ({ protocol: k, count: stats[k].count, volumeMB: stats[k].vol }));
  }

  static detectDdosSignatures(pcaps: Pcap[]): boolean {
    const recentSpike = pcaps.filter(p => p.protocol === 'UDP' || p.protocol === 'ICMP').length;
    return recentSpike > 50; // Threshold
  }
}

export class CloudSecLogic {
  static auditIamRoles(nodes: SystemNode[]): { resource: string, issue: string }[] {
    // Mock check: Look for nodes with 'Cloud' type and specific config flags (simulated via name/tags)
    return nodes
      .filter(n => n.type === 'Database' && n.dataSensitivity === 'PUBLIC')
      .map(n => ({ resource: n.name, issue: 'Publicly Accessible Database (Risk: High)' }));
  }

  static checkMisconfigurations(nodes: SystemNode[]): number {
    return nodes.filter(n => n.vendor === 'AWS' && n.securityControls.length < 2).length;
  }
}
