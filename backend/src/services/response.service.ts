
import { Playbook } from '../models/operations';
import { AuditService } from './audit.service';

interface CreatePlaybookInput {
  name: string;
  description?: string;
  tasks: string[];
  triggerLabel?: string;
}

interface PlaybookExecutionResult {
  success: boolean;
  message: string;
}

export class ResponseService {
  static async getPlaybooks(): Promise<Playbook[]> {
    return await (Playbook as any).findAll({ order: [['name', 'ASC']] });
  }

  static async createPlaybook(data: CreatePlaybookInput, userId: string): Promise<Playbook> {
    const id = `PB-${Date.now()}`;
    const pb = await (Playbook as any).create({
      id,
      name: data.name,
      description: data.description,
      tasks: data.tasks,
      trigger_label: data.triggerLabel,
      status: 'ACTIVE'
    });

    await AuditService.log(userId, 'PLAYBOOK_CREATED', `Created playbook ${data.name}`, id);
    return pb;
  }

  static async executePlaybook(id: string, caseId: string, userId: string): Promise<PlaybookExecutionResult> {
    await AuditService.log(userId, 'PLAYBOOK_EXEC', `Executed playbook ${id} on case ${caseId}`);
    return { success: true, message: 'Tasks generated' };
  }
}
