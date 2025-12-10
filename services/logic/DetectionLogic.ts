
import { AuditLog, SystemNode, SystemUser, DetectionRuleValidation, MemoryFinding, DiskFinding } from '../../types';
import { apiClient } from '../apiClient';

export class DetectionLogic {
  // --- Rule Engines ---
  static async validateYara(rule: string): Promise<DetectionRuleValidation> {
    try {
      return await apiClient.post<DetectionRuleValidation>('/analysis/detection/rule', { type: 'YARA', content: rule });
    } catch (e) {
      return { valid: false, error: 'Validation Service Unavailable' };
    }
  }

  static async transpileSigma(yaml: string, target: 'SPLUNK' | 'ELASTIC'): Promise<string> {
    try {
      const res = await apiClient.post<{ data: string }>('/analysis/detection/rule', { type: 'SIGMA', content: yaml, target });
      // ApiClient unwraps 'data' property usually, but strict return types help here.
      // Assuming apiClient wraps standard T
      return (res as unknown as { data: string }).data || '# Transpilation Error';
    } catch {
      return '# Transpilation Service Unavailable';
    }
  }

  // --- Forensics (Migrated to Backend) ---
  static async analyzeMemory(node: SystemNode): Promise<string[]> {
    try {
      return await apiClient.get<string[]>(`/analysis/detection/memory/${node.id}`);
    } catch {
      return ['Analysis unavailable (Offline)'];
    }
  }

  static async analyzeDiskMFT(node: SystemNode): Promise<DiskFinding[]> {
    try {
      return await apiClient.get<DiskFinding[]>(`/analysis/detection/disk/${node.id}`);
    } catch {
      return [];
    }
  }

  // --- Behavioral ---
  static async runUEBA(user: SystemUser, logs: AuditLog[]): Promise<number> {
    try {
      return await apiClient.post<number>('/analysis/detection/ueba', { user, logs });
    } catch {
      return 0;
    }
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
