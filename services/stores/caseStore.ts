import { Case, Playbook, Task } from '../../types';
import { LogicEngine } from '../logicEngine';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';
import { BaseStore } from './baseStore';

export class CaseStore extends BaseStore<Case> {
  constructor(key: string, initialData: Case[], adapter: DatabaseAdapter, mapper?: DataMapper<Case>) {
    super(key, initialData, adapter, mapper);
  }

  getCases() { return this.items.map(c => LogicEngine.checkSLA(c)); }

  addCase(c: Case, playbooks: Playbook[], onNote: (id: string, note: string) => void) {
    const { allowed, reason } = LogicEngine.validateAssignment(c, this.items);
    if (!allowed && reason) {
      c.assignee = 'Unassigned';
      c.description = `[SYSTEM NOTE: ${reason}]\n\n` + c.description;
    }
    this.add(c);
  }

  applyPlaybook(caseId: string, pb: Playbook, onNote: (id: string, n: string) => void) {
    const res = this.getById(caseId);
    if (res.success && res.data && pb) {
        const currentCase = res.data;
        const newTasks: Task[] = pb.tasks.map(t => ({ id: `t-${Date.now()}-${Math.random()}`, title: t, status: 'PENDING' }));
        const updatedCase = {
            ...currentCase,
            tasks: [...currentCase.tasks, ...newTasks]
        };
        onNote(caseId, `Applied ${pb.name}`);
        this.update(updatedCase);
    }
  }

  addNote(caseId: string, content: string) {
    const res = this.getById(caseId);
    if (res.success && res.data) {
      const c = res.data;
      c.notes.unshift({ id: Date.now().toString(), author: 'System', date: new Date().toLocaleTimeString(), content, isInternal: true });
      this.update(c);
    }
  }

  addTask(caseId: string, task: Task) {
    const res = this.getById(caseId);
    if (res.success && res.data) {
      const c = res.data;
      if (LogicEngine.detectTaskCycles(c.tasks, task)) { alert("Circular dependency detected!"); return; }
      c.tasks.push(task);
      this.update(c);
    }
  }

  linkCases(sourceId: string, targetId: string) {
    const sourceRes = this.getById(sourceId);
    const targetRes = this.getById(targetId);
    if (sourceRes.success && sourceRes.data && targetRes.success && targetRes.data && sourceId !== targetId) {
      const source = sourceRes.data;
      const target = targetRes.data;
      if (!source.linkedCaseIds?.includes(targetId)) source.linkedCaseIds = [...(source.linkedCaseIds || []), targetId];
      if (!target.linkedCaseIds?.includes(sourceId)) target.linkedCaseIds = [...(target.linkedCaseIds || []), sourceId];
      this.update(source);
      this.update(target);
    }
  }

  unlinkCases(sourceId: string, targetId: string) {
    const sourceRes = this.getById(sourceId);
    if (sourceRes.success && sourceRes.data) {
        const source = sourceRes.data;
        source.linkedCaseIds = (source.linkedCaseIds || []).filter(id => id !== targetId);
        this.update(source);
    }
    const targetRes = this.getById(targetId);
    if (targetRes.success && targetRes.data) {
        const target = targetRes.data;
        target.linkedCaseIds = (target.linkedCaseIds || []).filter(id => id !== sourceId);
        this.update(target);
    }
  }
}