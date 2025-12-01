
import { AuditLog, SystemNode, SystemUser } from '@/types';

export class DetectionLogic {
  // --- Rule Engines ---
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

  // --- Forensics ---
  static analyzeMemory(node: SystemNode): string[] {
    const findings = [];
    if (node.load > 80) findings.push(`PID 445 (svchost.exe) - High CPU - Potential Miner`);
    if ((node.networkConnections || 0) > 50) findings.push(`PID 882 (powershell.exe) - C2 Beacon Pattern`);
    return findings.length ? findings : ['No memory anomalies detected.'];
  }

  static analyzeDiskMFT(node: SystemNode): { file: string; status: string }[] {
    return [
      { file: 'C:\\Windows\\System32\\cmd.exe', status: 'Modified (M) - 2m ago' },
      { file: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\mimikatz.exe', status: 'Created (B) - 10m ago' },
      { file: 'D:\\Backups\\sensitive.zip', status: 'Access (A) - 1h ago' }
    ];
  }

  // --- Behavioral ---
  static runUEBA(user: SystemUser, logs: AuditLog[]): number {
    const userLogs = logs.filter(l => l.user === user.name);
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

  // --- Crypto ---
  static decrypt(input: string, method: 'BASE64' | 'HEX' | 'XOR', key?: string): string {
    try {
      if (method === 'BASE64') return atob(input);
      if (method === 'HEX') return input.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || '';
      if (method === 'XOR' && key) {
        return input.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');
      }
    } catch (e) { return 'DECRYPTION FAILED'; }
    return input;
  }
}