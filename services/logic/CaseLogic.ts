
import { Case, Playbook, Task } from '../../types';
import { apiClient } from '../apiClient';

export class CaseLogic {
  
  static async generateReportDraft(c: Case, type: string): Promise<string> {
    try {
      const res = await apiClient.post<{ content: string }>('/reports/generate-draft', { caseId: c.id, type });
      return res.content;
    } catch {
      return `OFFLINE DRAFT\nCASE: ${c.title}\n\nBackend service unavailable for full generation.`;
    }
  }

  static checkSLA(kase: Case): Case {
      if (kase.status === 'CLOSED') return kase;
      const created = new Date(kase.created).getTime();
      const now = Date.now();
      const hoursElapsed = (now - created) / (1000 * 60 * 60);
      const slaLimit = kase.priority === 'CRITICAL' ? 4 : kase.priority === 'HIGH' ? 24 : 72;
      
      if (hoursElapsed > slaLimit && !kase.slaBreach) {
          return { ...kase, slaBreach: true };
      }
      return kase; 
  }

  static async correlateCases(c: Case, all: Case[]): Promise<string[]> { 
      try {
        return await apiClient.get<string[]>(`/analysis/cases/${c.id}/correlations`);
      } catch {
        return [];
      }
  }

  static async suggestPlaybook(c: Case, playbooks: Playbook[]): Promise<Playbook | null> { 
      try {
        return await apiClient.post<Playbook | null>('/analysis/cases/suggest-playbook', { case: c });
      } catch {
        return null;
      }
  }

  static validateAssignment(c: Case, all: Case[]): { allowed: boolean; reason?: string } { 
      if (c.priority === 'CRITICAL' && c.assignee !== 'Unassigned') {
          const userLoad = all.filter(k => k.assignee === c.assignee && k.status !== 'CLOSED').length;
          if (userLoad > 5) {
              return { allowed: false, reason: 'Assignee at max capacity (5 active cases).' };
          }
      }
      return { allowed: true }; 
  }

  static enforceDataSovereignty(kase: Case, targetAgency: string): boolean { return true; }
  static isTaskBlocked(task: Task, allTasks: Task[]): boolean { return false; }
  static getTaskBlockerName(task: Task, allTasks: Task[]): string { return ''; }
  static sortTasks(tasks: Task[]): Task[] { return [...tasks]; }
  static validateTransfer(c: Case, agency: string): boolean { return c.agency !== agency; }
  static validateSharing(c: Case, agency: string): boolean { return !c.sharedWith.includes(agency); }
}
