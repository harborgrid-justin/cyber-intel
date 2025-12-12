
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
    const whereClause: WhereOptions<Case> = {};
    if (filters.status) whereClause.status = filters.status;
    if (filters.assignee) whereClause.assignee = filters.assignee;
    if (filters.priority) whereClause.priority = filters.priority;
    if (filters.slaBreached !== undefined) whereClause.sla_breach = filters.slaBreached;

    return await CaseModel.findAll({
      where: whereClause,
      limit,
      order: [['createdAt', 'DESC']]
    });
  }

  static async create(data: CreateCaseInput, userId: string): Promise<Case> {
    const id = `CASE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    let template: CaseTemplate | undefined;
    let initialTasks: any[] = [];
    let slaDeadline: Date | undefined;

    // Apply template if specified
    if (data.templateId) {
      template = this.caseTemplates.find(t => t.id === data.templateId);
      if (template) {
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
    }

    // Automated assignment
    const assignee = await this.autoAssign(data, template);

    const newCase = await CaseModel.create({
      id,
      title: data.title,
      description: data.description || '',
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
    this.checkSLA(id);

    return newCase;
  }

  static async update(id: string, data: UpdateCaseInput, userId: string): Promise<Case | null> {
    const kase = await CaseModel.findByPk(id);
    if (kase) {
      const oldStatus = kase.get('status');
      await kase.update(data);

      // Add timeline event for status changes
      if (data.status && data.status !== oldStatus) {
        const timeline = kase.get('timeline') as any[] || [];
        timeline.push({
          id: `TL-${Date.now()}`,
          date: new Date().toISOString(),
          title: `Status changed to ${data.status}`,
          type: 'SYSTEM',
          description: `Case status updated from ${oldStatus} to ${data.status}`
        });
        await kase.update({ timeline });
      }

      await AuditService.log(userId, 'CASE_UPDATE', `Updated case ${id}`, id);
      return kase;
    }
    return null;
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
}
