
import { Case } from '../models/intelligence';
import { AuditService } from './audit.service';
import { ModelStatic, WhereOptions, Op } from 'sequelize';

const CaseModel = Case as ModelStatic<Case>;

interface CaseFilter {
  status?: string;
  assignee?: string;
  priority?: string;
  slaBreached?: boolean;
}

interface CreateCaseInput {
  title: string;
  description?: string;
  priority?: string;
  assignee?: string;
  templateId?: string;
}

interface UpdateCaseInput extends Partial<CreateCaseInput> {
  status?: string;
}

// Case Templates
interface CaseTemplate {
  id: string;
  name: string;
  description: string;
  defaultPriority: string;
  defaultTasks: Array<{ title: string; dependsOn?: string[] }>;
  defaultWorkflow: string[];
  slaHours: number;
  autoAssignRules?: AssignmentRule[];
}

// SLA Configuration
interface SLAConfig {
  priority: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
  escalationLevels: EscalationLevel[];
}

interface EscalationLevel {
  level: number;
  triggerAfterHours: number;
  escalateTo: string[];
  notifyChannels: string[];
}

// Assignment Rules
interface AssignmentRule {
  condition: string;
  assignTo: string;
  weight: number;
}

// Case Linking
interface CaseLinkage {
  sourceId: string;
  targetId: string;
  linkType: 'DUPLICATE' | 'RELATED' | 'PARENT' | 'CHILD' | 'BLOCKED_BY' | 'BLOCKS';
  createdBy: string;
  createdAt: Date;
}

export class CaseService {

  // Case Templates
  private static caseTemplates: CaseTemplate[] = [
    {
      id: 'TMPL-MALWARE',
      name: 'Malware Investigation',
      description: 'Standard malware incident response',
      defaultPriority: 'HIGH',
      defaultTasks: [
        { title: 'Isolate affected systems' },
        { title: 'Collect malware samples', dependsOn: ['Isolate affected systems'] },
        { title: 'Perform static analysis', dependsOn: ['Collect malware samples'] },
        { title: 'Perform dynamic analysis', dependsOn: ['Collect malware samples'] },
        { title: 'Identify IOCs', dependsOn: ['Perform static analysis', 'Perform dynamic analysis'] },
        { title: 'Update detection rules', dependsOn: ['Identify IOCs'] },
        { title: 'Remediate affected systems' }
      ],
      defaultWorkflow: ['OPEN', 'TRIAGED', 'INVESTIGATING', 'CONTAINMENT', 'ERADICATION', 'RECOVERY', 'CLOSED'],
      slaHours: 48,
      autoAssignRules: [{ condition: 'priority=CRITICAL', assignTo: 'senior-analyst', weight: 100 }]
    },
    {
      id: 'TMPL-PHISHING',
      name: 'Phishing Investigation',
      description: 'Phishing email investigation workflow',
      defaultPriority: 'MEDIUM',
      defaultTasks: [
        { title: 'Analyze email headers' },
        { title: 'Inspect URLs and attachments' },
        { title: 'Check if credentials were compromised' },
        { title: 'Block malicious domains' },
        { title: 'Reset affected user credentials' },
        { title: 'Conduct user awareness training' }
      ],
      defaultWorkflow: ['OPEN', 'ANALYSIS', 'CONTAINMENT', 'REMEDIATION', 'CLOSED'],
      slaHours: 24,
      autoAssignRules: [{ condition: 'priority=HIGH', assignTo: 'email-security-team', weight: 90 }]
    },
    {
      id: 'TMPL-DATA-BREACH',
      name: 'Data Breach Response',
      description: 'Data breach incident investigation',
      defaultPriority: 'CRITICAL',
      defaultTasks: [
        { title: 'Assess scope of breach' },
        { title: 'Identify data exfiltration vectors' },
        { title: 'Contain data leak' },
        { title: 'Preserve forensic evidence' },
        { title: 'Notify stakeholders' },
        { title: 'Regulatory notification (if required)' },
        { title: 'Conduct post-incident review' }
      ],
      defaultWorkflow: ['OPEN', 'ASSESSMENT', 'CONTAINMENT', 'INVESTIGATION', 'NOTIFICATION', 'REMEDIATION', 'CLOSED'],
      slaHours: 12,
      autoAssignRules: [{ condition: 'priority=CRITICAL', assignTo: 'incident-commander', weight: 100 }]
    },
    {
      id: 'TMPL-RANSOMWARE',
      name: 'Ransomware Response',
      description: 'Ransomware incident response',
      defaultPriority: 'CRITICAL',
      defaultTasks: [
        { title: 'Isolate infected systems immediately' },
        { title: 'Identify ransomware variant' },
        { title: 'Assess backup integrity' },
        { title: 'Determine encryption scope' },
        { title: 'Contact law enforcement' },
        { title: 'Initiate recovery from backups' },
        { title: 'Implement additional security controls' }
      ],
      defaultWorkflow: ['OPEN', 'CONTAINMENT', 'ANALYSIS', 'RECOVERY', 'HARDENING', 'CLOSED'],
      slaHours: 6,
      autoAssignRules: [{ condition: 'priority=CRITICAL', assignTo: 'ransomware-response-team', weight: 100 }]
    }
  ];

  // SLA Configurations by Priority
  private static slaConfigs: SLAConfig[] = [
    {
      priority: 'CRITICAL',
      responseTimeHours: 1,
      resolutionTimeHours: 12,
      escalationLevels: [
        { level: 1, triggerAfterHours: 2, escalateTo: ['senior-analyst'], notifyChannels: ['ops-critical'] },
        { level: 2, triggerAfterHours: 6, escalateTo: ['team-lead', 'manager'], notifyChannels: ['ops-critical', 'management'] },
        { level: 3, triggerAfterHours: 10, escalateTo: ['director', 'ciso'], notifyChannels: ['ops-critical', 'management', 'executive'] }
      ]
    },
    {
      priority: 'HIGH',
      responseTimeHours: 4,
      resolutionTimeHours: 48,
      escalationLevels: [
        { level: 1, triggerAfterHours: 8, escalateTo: ['senior-analyst'], notifyChannels: ['ops-high'] },
        { level: 2, triggerAfterHours: 24, escalateTo: ['team-lead'], notifyChannels: ['ops-high', 'management'] }
      ]
    },
    {
      priority: 'MEDIUM',
      responseTimeHours: 24,
      resolutionTimeHours: 120,
      escalationLevels: [
        { level: 1, triggerAfterHours: 48, escalateTo: ['team-lead'], notifyChannels: ['ops-medium'] }
      ]
    },
    {
      priority: 'LOW',
      responseTimeHours: 48,
      resolutionTimeHours: 240,
      escalationLevels: []
    }
  ];

  static async getAll(filters: CaseFilter, limit: number = 50): Promise<Case[]> {
    try {
      const whereClause: WhereOptions<Case> = {};
      if (filters.status) whereClause.status = filters.status;
      if (filters.assignee) whereClause.assignee = filters.assignee;
      if (filters.priority) whereClause.priority = filters.priority;
      if (filters.slaBreached !== undefined) whereClause.sla_breach = filters.slaBreached;

      const cases = await CaseModel.findAll({
        where: whereClause,
        limit,
        order: [['createdAt', 'DESC']]
      });

      // Check SLA for all active cases
      cases.forEach(caseItem => {
        if (caseItem.get('status') !== 'CLOSED') {
          this.checkSLA(caseItem.get('id') as string).catch(err =>
            console.error(`SLA check failed for ${caseItem.get('id')}:`, err)
          );
        }
      });

      return cases;
    } catch (error) {
      console.error('Error fetching cases:', error);
      throw new Error('Failed to retrieve cases from database');
    }
  }

  static async create(data: CreateCaseInput, userId: string): Promise<Case> {
    try {
      if (!data.title || data.title.trim().length === 0) {
        throw new Error('Case title is required');
      }

      const id = `CASE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      let template: CaseTemplate | undefined;
      let initialTasks: any[] = [];
      let slaDeadline: Date | undefined;

      // Apply template if specified
      if (data.templateId) {
        template = this.caseTemplates.find(t => t.id === data.templateId);
        if (!template) {
          throw new Error(`Template ${data.templateId} not found`);
        }

        initialTasks = template.defaultTasks.map((t, idx) => ({
          id: `TASK-${id}-${idx + 1}`,
          title: t.title,
          status: 'PENDING',
          dependsOn: t.dependsOn || []
        }));

        // Calculate SLA deadline
        const slaConfig = this.slaConfigs.find(s => s.priority === (data.priority || template!.defaultPriority));
        if (slaConfig) {
          slaDeadline = new Date(Date.now() + slaConfig.resolutionTimeHours * 60 * 60 * 1000);
        }
      }

      // Automated assignment
      const assignee = await this.autoAssign(data, template);

      const newCase = await CaseModel.create({
        id,
        title: data.title.trim(),
        description: data.description?.trim() || '',
        priority: data.priority || template?.defaultPriority || 'MEDIUM',
        status: 'OPEN',
        assignee: assignee || data.assignee || 'Unassigned',
        created_by: userId,
        related_threat_ids: [],
        shared_with: [],
        timeline: [{
          id: `TL-${Date.now()}`,
          date: new Date().toISOString(),
          title: 'Case Created',
          type: 'CASE',
          description: `Case created from ${template ? `template: ${template.name}` : 'manual input'}`
        }],
        tasks: initialTasks,
        sla_breach: false,
        sla_deadline: slaDeadline?.toISOString(),
        template_id: data.templateId
      } as any);

      await AuditService.log(userId, 'CASE_CREATED', `Created case ${id}${template ? ` from template ${template.name}` : ''}`, id);

      // Start SLA monitoring
      this.checkSLA(id).catch(err => console.error(`Initial SLA check failed for ${id}:`, err));

      return newCase;
    } catch (error) {
      console.error('Error creating case:', error);
      throw error;
    }
  }

  static async update(id: string, data: UpdateCaseInput, userId: string): Promise<Case | null> {
    try {
      const kase = await CaseModel.findByPk(id);
      if (!kase) {
        throw new Error(`Case ${id} not found`);
      }

      const oldStatus = kase.get('status');
      const oldPriority = kase.get('priority');
      const oldAssignee = kase.get('assignee');

      await kase.update(data);

      const timeline = kase.get('timeline') as any[] || [];

      // Add timeline event for status changes
      if (data.status && data.status !== oldStatus) {
        timeline.push({
          id: `TL-${Date.now()}`,
          date: new Date().toISOString(),
          title: `Status changed to ${data.status}`,
          type: 'SYSTEM',
          description: `Case status updated from ${oldStatus} to ${data.status} by ${userId}`
        });
      }

      // Add timeline event for priority changes
      if (data.priority && data.priority !== oldPriority) {
        timeline.push({
          id: `TL-${Date.now() + 1}`,
          date: new Date().toISOString(),
          title: `Priority changed to ${data.priority}`,
          type: 'ALERT',
          description: `Case priority updated from ${oldPriority} to ${data.priority} by ${userId}`
        });

        // Recalculate SLA deadline if priority changed
        const slaConfig = this.slaConfigs.find(s => s.priority === data.priority);
        if (slaConfig) {
          const createdAt = new Date(kase.get('created') as string || kase.get('createdAt') as string);
          const newDeadline = new Date(createdAt.getTime() + slaConfig.resolutionTimeHours * 60 * 60 * 1000);
          await kase.update({ sla_deadline: newDeadline.toISOString() });
        }
      }

      // Add timeline event for assignee changes
      if (data.assignee && data.assignee !== oldAssignee) {
        timeline.push({
          id: `TL-${Date.now() + 2}`,
          date: new Date().toISOString(),
          title: `Reassigned to ${data.assignee}`,
          type: 'SYSTEM',
          description: `Case reassigned from ${oldAssignee} to ${data.assignee} by ${userId}`
        });
      }

      if (timeline.length > (kase.get('timeline') as any[] || []).length) {
        await kase.update({ timeline });
      }

      await AuditService.log(userId, 'CASE_UPDATE', `Updated case ${id}`, id);

      // Re-check SLA if case is still open
      if (data.status !== 'CLOSED') {
        this.checkSLA(id).catch(err => console.error(`SLA check failed for ${id}:`, err));
      }

      return kase;
    } catch (error) {
      console.error('Error updating case:', error);
      throw error;
    }
  }

  // Case Templates
  static getTemplates(): CaseTemplate[] {
    return this.caseTemplates;
  }

  static getTemplate(id: string): CaseTemplate | undefined {
    return this.caseTemplates.find(t => t.id === id);
  }

  // Automated Assignment
  private static async autoAssign(data: CreateCaseInput, template?: CaseTemplate): Promise<string | null> {
    if (!template?.autoAssignRules || template.autoAssignRules.length === 0) {
      return null;
    }

    // Simple rule matching - in production, this would be more sophisticated
    const priority = data.priority || template.defaultPriority;
    const matchingRules = template.autoAssignRules.filter(rule =>
      rule.condition.includes(priority)
    );

    if (matchingRules.length > 0) {
      // Return highest weight rule
      const bestRule = matchingRules.reduce((prev, current) =>
        prev.weight > current.weight ? prev : current
      );
      return bestRule.assignTo;
    }

    return null;
  }

  // SLA Tracking
  static async checkSLA(caseId: string): Promise<void> {
    const kase = await CaseModel.findByPk(caseId);
    if (!kase) return;

    const priority = kase.get('priority') as string;
    const createdAt = new Date(kase.get('created') as string || kase.get('createdAt') as string);
    const status = kase.get('status') as string;

    // Don't check SLA for closed cases
    if (status === 'CLOSED') return;

    const slaConfig = this.slaConfigs.find(s => s.priority === priority);
    if (!slaConfig) return;

    const hoursElapsed = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

    // Check for SLA breach
    if (hoursElapsed > slaConfig.resolutionTimeHours && !kase.get('sla_breach')) {
      await kase.update({ sla_breach: true });
      await AuditService.log('SYSTEM', 'SLA_BREACH', `Case ${caseId} exceeded SLA`, caseId);
    }

    // Check escalation levels
    for (const escalation of slaConfig.escalationLevels) {
      if (hoursElapsed >= escalation.triggerAfterHours) {
        await this.escalate(caseId, escalation);
      }
    }
  }

  // Escalation
  private static async escalate(caseId: string, escalation: EscalationLevel): Promise<void> {
    const kase = await CaseModel.findByPk(caseId);
    if (!kase) return;

    // Check if already escalated to this level
    const timeline = kase.get('timeline') as any[] || [];
    const alreadyEscalated = timeline.some(e =>
      e.type === 'SYSTEM' && e.description?.includes(`Escalated to level ${escalation.level}`)
    );

    if (alreadyEscalated) return;

    // Add escalation to timeline
    timeline.push({
      id: `TL-${Date.now()}`,
      date: new Date().toISOString(),
      title: `Case Escalated - Level ${escalation.level}`,
      type: 'ALERT',
      description: `Escalated to level ${escalation.level}. Notified: ${escalation.escalateTo.join(', ')}`
    });

    await kase.update({ timeline });
    await AuditService.log('SYSTEM', 'CASE_ESCALATED', `Case ${caseId} escalated to level ${escalation.level}`, caseId);

    // In production, this would trigger actual notifications
    console.log(`[ESCALATION] Case ${caseId} escalated to ${escalation.escalateTo.join(', ')} via ${escalation.notifyChannels.join(', ')}`);
  }

  // Case Linking
  static async linkCases(sourceId: string, targetId: string, linkType: CaseLinkage['linkType'], userId: string): Promise<void> {
    const sourceCase = await CaseModel.findByPk(sourceId);
    const targetCase = await CaseModel.findByPk(targetId);

    if (!sourceCase || !targetCase) {
      throw new Error('One or both cases not found');
    }

    // Update both cases with link information
    const sourceLinks = (sourceCase.get('linkedCaseIds') as string[] || []);
    const targetLinks = (targetCase.get('linkedCaseIds') as string[] || []);

    if (!sourceLinks.includes(targetId)) {
      sourceLinks.push(targetId);
      await sourceCase.update({ linkedCaseIds: sourceLinks });
    }

    if (!targetLinks.includes(sourceId)) {
      targetLinks.push(sourceId);
      await targetCase.update({ linkedCaseIds: targetLinks });
    }

    await AuditService.log(userId, 'CASE_LINKED', `Linked case ${sourceId} to ${targetId} as ${linkType}`, sourceId);
  }

  static async unlinkCases(sourceId: string, targetId: string, userId: string): Promise<void> {
    const sourceCase = await CaseModel.findByPk(sourceId);
    const targetCase = await CaseModel.findByPk(targetId);

    if (!sourceCase || !targetCase) return;

    const sourceLinks = (sourceCase.get('linkedCaseIds') as string[] || []).filter(id => id !== targetId);
    const targetLinks = (targetCase.get('linkedCaseIds') as string[] || []).filter(id => id !== sourceId);

    await sourceCase.update({ linkedCaseIds: sourceLinks });
    await targetCase.update({ linkedCaseIds: targetLinks });

    await AuditService.log(userId, 'CASE_UNLINKED', `Unlinked case ${sourceId} from ${targetId}`, sourceId);
  }

  // Case Merging
  static async mergeCases(primaryId: string, secondaryIds: string[], userId: string): Promise<Case | null> {
    const primary = await CaseModel.findByPk(primaryId);
    if (!primary) return null;

    for (const secondaryId of secondaryIds) {
      const secondary = await CaseModel.findByPk(secondaryId);
      if (!secondary) continue;

      // Merge timeline
      const primaryTimeline = primary.get('timeline') as any[] || [];
      const secondaryTimeline = secondary.get('timeline') as any[] || [];
      const mergedTimeline = [...primaryTimeline, ...secondaryTimeline].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Merge tasks
      const primaryTasks = primary.get('tasks') as any[] || [];
      const secondaryTasks = secondary.get('tasks') as any[] || [];
      const mergedTasks = [...primaryTasks, ...secondaryTasks];

      // Merge related threats
      const primaryThreats = primary.get('related_threat_ids') as string[] || [];
      const secondaryThreats = secondary.get('related_threat_ids') as string[] || [];
      const mergedThreats = Array.from(new Set([...primaryThreats, ...secondaryThreats]));

      // Update primary case
      await primary.update({
        timeline: mergedTimeline,
        tasks: mergedTasks,
        related_threat_ids: mergedThreats,
        description: `${primary.get('description')}\n\n--- MERGED FROM ${secondaryId} ---\n${secondary.get('description')}`
      });

      // Mark secondary as merged
      await secondary.update({
        status: 'CLOSED',
        description: `${secondary.get('description')}\n\n[MERGED INTO ${primaryId}]`
      });

      await AuditService.log(userId, 'CASE_MERGED', `Merged case ${secondaryId} into ${primaryId}`, primaryId);
    }

    return primary;
  }

  // Get SLA Configuration
  static getSLAConfig(priority: string): SLAConfig | undefined {
    return this.slaConfigs.find(s => s.priority === priority);
  }

  // Batch SLA Check (would be run by scheduled job)
  static async checkAllSLAs(): Promise<void> {
    const openCases = await CaseModel.findAll({
      where: { status: { [Op.ne]: 'CLOSED' } }
    });

    for (const kase of openCases) {
      await this.checkSLA(kase.get('id') as string);
    }
  }

  // Add task to case
  static async addTask(caseId: string, task: { title: string; dependsOn?: string[] }, userId: string): Promise<void> {
    try {
      const kase = await CaseModel.findByPk(caseId);
      if (!kase) throw new Error(`Case ${caseId} not found`);

      const tasks = kase.get('tasks') as any[] || [];
      const newTask = {
        id: `TASK-${caseId}-${tasks.length + 1}`,
        title: task.title,
        status: 'PENDING',
        dependsOn: task.dependsOn || []
      };

      tasks.push(newTask);
      await kase.update({ tasks });

      await AuditService.log(userId, 'TASK_ADDED', `Added task "${task.title}" to case ${caseId}`, caseId);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  // Toggle task status
  static async toggleTask(caseId: string, taskId: string, userId: string): Promise<void> {
    try {
      const kase = await CaseModel.findByPk(caseId);
      if (!kase) throw new Error(`Case ${caseId} not found`);

      const tasks = kase.get('tasks') as any[] || [];
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error(`Task ${taskId} not found`);

      task.status = task.status === 'PENDING' ? 'DONE' : 'PENDING';
      await kase.update({ tasks });

      await AuditService.log(userId, 'TASK_UPDATED', `Updated task ${taskId} in case ${caseId} to ${task.status}`, caseId);
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  }

  // Add note/comment to case
  static async addNote(caseId: string, content: string, userId: string, isInternal: boolean = false): Promise<void> {
    try {
      const kase = await CaseModel.findByPk(caseId);
      if (!kase) throw new Error(`Case ${caseId} not found`);

      const notes = kase.get('notes') as any[] || [];
      const newNote = {
        id: `NOTE-${Date.now()}`,
        author: userId,
        date: new Date().toISOString(),
        content,
        isInternal
      };

      notes.unshift(newNote);
      await kase.update({ notes });

      await AuditService.log(userId, 'NOTE_ADDED', `Added ${isInternal ? 'internal ' : ''}note to case ${caseId}`, caseId);
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  // Add artifact to case
  static async addArtifact(caseId: string, artifact: Omit<any, 'id'>, userId: string): Promise<void> {
    try {
      const kase = await CaseModel.findByPk(caseId);
      if (!kase) throw new Error(`Case ${caseId} not found`);

      const artifacts = kase.get('artifacts') as any[] || [];
      const newArtifact = {
        ...artifact,
        id: `ART-${caseId}-${artifacts.length + 1}`,
        uploadedBy: userId,
        uploadDate: new Date().toISOString()
      };

      artifacts.push(newArtifact);
      await kase.update({ artifacts });

      // Add timeline entry
      const timeline = kase.get('timeline') as any[] || [];
      timeline.push({
        id: `TL-${Date.now()}`,
        date: new Date().toISOString(),
        title: 'Evidence Added',
        type: 'SYSTEM',
        description: `Added artifact: ${artifact.name}`
      });
      await kase.update({ timeline });

      await AuditService.log(userId, 'ARTIFACT_ADDED', `Added artifact ${newArtifact.id} to case ${caseId}`, caseId);
    } catch (error) {
      console.error('Error adding artifact:', error);
      throw error;
    }
  }

  // Delete artifact from case
  static async deleteArtifact(caseId: string, artifactId: string, userId: string): Promise<void> {
    try {
      const kase = await CaseModel.findByPk(caseId);
      if (!kase) throw new Error(`Case ${caseId} not found`);

      const artifacts = (kase.get('artifacts') as any[] || []).filter(a => a.id !== artifactId);
      await kase.update({ artifacts });

      await AuditService.log(userId, 'ARTIFACT_DELETED', `Deleted artifact ${artifactId} from case ${caseId}`, caseId);
    } catch (error) {
      console.error('Error deleting artifact:', error);
      throw error;
    }
  }

  // Get case statistics
  static async getStatistics(): Promise<any> {
    try {
      const allCases = await CaseModel.findAll();

      const stats = {
        total: allCases.length,
        byStatus: {
          open: allCases.filter(c => c.get('status') === 'OPEN').length,
          in_progress: allCases.filter(c => c.get('status') === 'IN_PROGRESS').length,
          pending_review: allCases.filter(c => c.get('status') === 'PENDING_REVIEW').length,
          closed: allCases.filter(c => c.get('status') === 'CLOSED').length
        },
        byPriority: {
          critical: allCases.filter(c => c.get('priority') === 'CRITICAL').length,
          high: allCases.filter(c => c.get('priority') === 'HIGH').length,
          medium: allCases.filter(c => c.get('priority') === 'MEDIUM').length,
          low: allCases.filter(c => c.get('priority') === 'LOW').length
        },
        slaBreaches: allCases.filter(c => c.get('sla_breach') === true).length,
        avgResolutionTime: this.calculateAvgResolutionTime(allCases),
        totalArtifacts: allCases.reduce((sum, c) => sum + ((c.get('artifacts') as any[] || []).length), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  // Helper: Calculate average resolution time
  private static calculateAvgResolutionTime(cases: Case[]): string {
    const closedCases = cases.filter(c => c.get('status') === 'CLOSED');
    if (closedCases.length === 0) return 'N/A';

    const totalHours = closedCases.reduce((sum, c) => {
      const created = new Date(c.get('created') as string || c.get('createdAt') as string);
      const updated = new Date(c.get('updated') as string || c.get('updatedAt') as string);
      return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
    }, 0);

    const avgHours = totalHours / closedCases.length;
    if (avgHours < 24) return `${avgHours.toFixed(1)}h`;
    return `${(avgHours / 24).toFixed(1)}d`;
  }

  // Get case by ID
  static async getById(id: string): Promise<Case | null> {
    try {
      const kase = await CaseModel.findByPk(id);
      if (kase && kase.get('status') !== 'CLOSED') {
        await this.checkSLA(id).catch(err => console.error(`SLA check failed:`, err));
      }
      return kase;
    } catch (error) {
      console.error('Error fetching case:', error);
      throw error;
    }
  }

  // Apply playbook to case
  static async applyPlaybook(caseId: string, playbookId: string, userId: string): Promise<void> {
    try {
      const kase = await CaseModel.findByPk(caseId);
      if (!kase) throw new Error(`Case ${caseId} not found`);

      // In a real implementation, you would fetch the playbook from a playbook service
      // For now, we'll use the templates
      const template = this.caseTemplates.find(t => t.id === playbookId);
      if (!template) throw new Error(`Playbook ${playbookId} not found`);

      const existingTasks = kase.get('tasks') as any[] || [];
      const newTasks = template.defaultTasks.map((t, idx) => ({
        id: `TASK-${caseId}-PB-${Date.now()}-${idx}`,
        title: t.title,
        status: 'PENDING',
        dependsOn: t.dependsOn || []
      }));

      await kase.update({ tasks: [...existingTasks, ...newTasks] });

      // Add timeline entry
      const timeline = kase.get('timeline') as any[] || [];
      timeline.push({
        id: `TL-${Date.now()}`,
        date: new Date().toISOString(),
        title: `Playbook Applied: ${template.name}`,
        type: 'ACTION',
        description: `Applied playbook ${template.name} adding ${newTasks.length} tasks`
      });
      await kase.update({ timeline });

      await AuditService.log(userId, 'PLAYBOOK_APPLIED', `Applied playbook ${template.name} to case ${caseId}`, caseId);
    } catch (error) {
      console.error('Error applying playbook:', error);
      throw error;
    }
  }
}
