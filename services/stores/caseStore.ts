
import { Case, Playbook } from '../../types';
import { BaseStore } from './baseStore';
import { LogicEngine } from '../logicEngine';

export class CaseStore extends BaseStore<Case> {
  getCases() { return this.items.map(c => LogicEngine.checkSLA(c)); }

  addCase(c: Case, playbooks: Playbook[], onNote: (id: string, note: string) => void) {
    const { allowed, reason } = LogicEngine.validateAssignment(c, this.items);
    if (!allowed && reason) {
      c.assignee = 'Unassigned';
      c.description = `[SYSTEM NOTE: ${reason}]\n\n` + c.description;
    }
    this.add(c);
    const suggestedPb = LogicEngine.suggestPlaybook(c, playbooks);
    if (suggestedPb) {
      this.applyPlaybook(c.id, suggestedPb, onNote);
      onNote(c.id, `LogicEngine: Auto-deployed '${suggestedPb.name}'.`);
    }
  }

  applyPlaybook(caseId: string, pb: Playbook, onNote: (id: string, n: string) => void) {
    const c = this.getById(caseId);
    if (c && pb) {
      pb.usageCount = (pb.usageCount || 0) + 1; // Needs playbook store update externally
      pb.tasks.forEach(t => c.tasks.push({ id: `t-${Date.now()}-${Math.random()}`, title: t, status: 'PENDING' }));
      onNote(caseId, `Applied ${pb.name}`);
      this.update(c);
    }
  }

  addNote(caseId: string, content: string) {
    const c = this.getById(caseId);
    if (c) {
      c.notes.unshift({ id: Date.now().toString(), author: 'System', date: new Date().toLocaleTimeString(), content, isInternal: true });
      this.update(c);
    }
  }

  addTask(caseId: string, task: any) {
    const c = this.getById(caseId);
    if (c) {
      if (LogicEngine.detectTaskCycles(c.tasks, task)) { alert("Circular dependency!"); return; }
      c.tasks.push(task);
      this.update(c);
    }
  }
}
