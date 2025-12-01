
import { Case, Playbook } from '../../types';

export class CaseLogic {
  static checkSLA(kase: Case) { 
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

  static correlateCases(c: Case, all: Case[]) { 
      const related = all.filter(other => 
          other.id !== c.id && other.relatedThreatIds.some(tid => c.relatedThreatIds.includes(tid))
      );
      return related.map(r => r.id); 
  }

  static suggestPlaybook(c: Case, playbooks: Playbook[]) { 
      return playbooks.find(pb => c.labels.includes(pb.triggerLabel || ''));
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

  static enforceDataSovereignty(kase: Case, targetAgency: string): boolean {
    const EU_AGENCIES = ['INTERPOL', 'EUROPOL', 'ANSSI'];
    const US_AGENCIES = ['FBI_CYBER', 'NSA', 'CISA'];
    if (kase.region === 'EU' && US_AGENCIES.includes(targetAgency)) return false;
    return true;
  }
}
