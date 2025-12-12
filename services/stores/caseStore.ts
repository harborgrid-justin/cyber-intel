import { Case, Playbook, Task } from '../../types';
import { LogicEngine } from '../logicEngine';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';
import { BaseStore } from './baseStore';
import { Result, ok, fail, AppError } from '../../types/result';
import { bus, EVENTS } from '../eventBus';

export class CaseStore extends BaseStore<Case> {
  constructor(key: string, initialData: Case[], adapter: DatabaseAdapter, mapper?: DataMapper<Case>) {
    super(key, initialData, adapter, mapper);
  }

  protected override initializeEventSubscriptions(): void {
    // Listen for threat updates that might affect cases
    bus.on(EVENTS.DATA_UPDATE, (payload: any) => {
      if (payload?.storeKey === 'THREATS') {
        // Potentially refresh case-threat relationships
        this.notify();
      }
    });
  }

  getCases() { return this.items.map(c => LogicEngine.checkSLA(c)); }

  addCase(c: Case, playbooks: Playbook[], onNote: (id: string, note: string) => void): Result<void> {
    try {
      const { allowed, reason } = LogicEngine.validateAssignment(c, this.items);
      if (!allowed && reason) {
        c.assignee = 'Unassigned';
        c.description = `[SYSTEM NOTE: ${reason}]\n\n` + c.description;
      }
      return this.add(c);
    } catch (e) {
      return fail(new AppError('Failed to add case', 'SYSTEM', { originalError: e }));
    }
  }

  applyPlaybook(caseId: string, pb: Playbook, onNote: (id: string, n: string) => void): Result<void> {
    try {
      const res = this.getById(caseId);
      if (res.success && res.data && pb) {
          const currentCase = res.data;
          const newTasks: Task[] = pb.tasks.map(t => ({ id: `t-${Date.now()}-${Math.random()}`, title: t, status: 'PENDING' }));
          const updatedCase = {
              ...currentCase,
              tasks: [...currentCase.tasks, ...newTasks]
          };
          onNote(caseId, `Applied ${pb.name}`);
          return this.update(updatedCase);
      }
      return fail(new AppError('Case not found or invalid playbook', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to apply playbook', 'SYSTEM', { originalError: e }));
    }
  }

  addNote(caseId: string, content: string): Result<void> {
    try {
      const res = this.getById(caseId);
      if (res.success && res.data) {
        const c = res.data;
        c.notes.unshift({ id: Date.now().toString(), author: 'System', date: new Date().toLocaleTimeString(), content, isInternal: true });
        return this.update(c);
      }
      return fail(new AppError('Case not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to add note', 'SYSTEM', { originalError: e }));
    }
  }

  addTask(caseId: string, task: Task): Result<void> {
    try {
      const res = this.getById(caseId);
      if (res.success && res.data) {
        const c = res.data;
        if (LogicEngine.detectTaskCycles(c.tasks, task)) {
          return fail(new AppError('Circular dependency detected', 'VALIDATION'));
        }
        c.tasks.push(task);
        return this.update(c);
      }
      return fail(new AppError('Case not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to add task', 'SYSTEM', { originalError: e }));
    }
  }

  linkCases(sourceId: string, targetId: string): Result<void> {
    try {
      const sourceRes = this.getById(sourceId);
      const targetRes = this.getById(targetId);
      if (sourceRes.success && sourceRes.data && targetRes.success && targetRes.data && sourceId !== targetId) {
        const source = sourceRes.data;
        const target = targetRes.data;
        if (!source.linkedCaseIds?.includes(targetId)) source.linkedCaseIds = [...(source.linkedCaseIds || []), targetId];
        if (!target.linkedCaseIds?.includes(sourceId)) target.linkedCaseIds = [...(target.linkedCaseIds || []), sourceId];
        this.update(source);
        this.update(target);
        return ok(undefined);
      }
      return fail(new AppError('Invalid case IDs for linking', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to link cases', 'SYSTEM', { originalError: e }));
    }
  }

  unlinkCases(sourceId: string, targetId: string): Result<void> {
    try {
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
      return ok(undefined);
    } catch (e) {
      return fail(new AppError('Failed to unlink cases', 'SYSTEM', { originalError: e }));
    }
  }
}