
import { Asset } from '../../models/infrastructure';

export class DetectionEngine {
  static validateYara(rule: string): { valid: boolean; error?: string } {
    if (!rule.includes('rule ') || !rule.includes('{') || !rule.includes('condition:')) {
      return { valid: false, error: 'Invalid Structure: Missing rule definition or condition block.' };
    }
    return { valid: true };
  }

  static transpileSigma(yaml: string, target: 'SPLUNK' | 'ELASTIC'): string {
    if (!yaml.includes('detection:')) return '# Invalid Sigma Rule';
    const field = yaml.match(/field:\s*(\w+)/)?.[1] || '*';
    const value = yaml.match(/value:\s*['"]?([^'"]+)['"]?/)?.[1] || '*';
    
    if (target === 'SPLUNK') return `index=main sourcetype=* | search ${field}="${value}" | stats count by host`;
    return `GET /_search { "query": { "match": { "${field}": "${value}" } } }`;
  }

  static runUEBA(user: any, logs: any[]): number {
    const userLogs = logs.filter(l => l.user_id === user.username || l.user === user.username);
    let risk = 0;
    
    const fails = userLogs.filter(l => l.action.includes('FAIL')).length;
    risk += fails * 10;

    const offHours = userLogs.filter(l => {
      const h = new Date(l.timestamp).getHours();
      return h < 6 || h > 20;
    }).length;
    risk += offHours * 5;

    if (user.status === 'LOCKED') risk += 50;
    return Math.min(100, risk);
  }

  // --- New Forensics ---
  static async analyzeMemory(nodeId: string): Promise<string[]> {
    const node = await (Asset as any).findByPk(nodeId);
    if (!node) return ['Node not found'];

    // Simulated Volatility analysis based on node metadata
    const findings = [];
    if (node.status === 'DEGRADED') findings.push(`PID 445 (svchost.exe) - High CPU - Potential Miner`);
    if (node.type === 'Workstation') findings.push(`PID 882 (powershell.exe) - C2 Beacon Pattern`);
    return findings.length ? findings : ['No memory anomalies detected.'];
  }

  static async analyzeDisk(nodeId: string) {
    const node = await (Asset as any).findByPk(nodeId);
    if (!node) return [];
    
    return [
      { file: 'C:\\Windows\\System32\\cmd.exe', status: 'Modified (M) - 2m ago' },
      { file: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\mimikatz.exe', status: 'Created (B) - 10m ago' },
      { file: 'D:\\Backups\\sensitive.zip', status: 'Access (A) - 1h ago' }
    ];
  }
}
