
import { AuditService } from '../audit.service';
import { NotificationService } from './notification.service';
import { logger } from '../../utils/logger';

export interface EscalationPolicy {
  id: string;
  name: string;
  description: string;
  triggers: EscalationTrigger[];
  levels: EscalationLevel[];
  enabled: boolean;
  metadata: {
    createdBy: string;
    createdAt: string;
    lastModified: string;
  };
}

export interface EscalationTrigger {
  type: 'TIME_BASED' | 'SLA_BREACH' | 'PRIORITY_CHANGE' | 'CUSTOM';
  condition: string;
  parameters: Record<string, any>;
}

export interface EscalationLevel {
  level: number;
  name: string;
  description: string;
  triggerAfterMinutes: number;
  assignTo: string[];
  notifyChannels: string[];
  actions: EscalationAction[];
  autoReassign: boolean;
}

export interface EscalationAction {
  type: 'NOTIFY' | 'REASSIGN' | 'PRIORITY_INCREASE' | 'PLAYBOOK' | 'CUSTOM';
  target: string;
  parameters: Record<string, any>;
}

export interface EscalationEvent {
  id: string;
  policyId: string;
  caseId: string;
  level: number;
  triggeredAt: string;
  triggeredBy: string;
  reason: string;
  status: 'TRIGGERED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  actions: EscalationActionResult[];
  completedAt?: string;
}

export interface EscalationActionResult {
  action: EscalationAction;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  completedAt?: string;
  error?: string;
  output?: any;
}

export class EscalationService {
  private static policies: Map<string, EscalationPolicy> = new Map();
  private static events: Map<string, EscalationEvent> = new Map();
  private static caseEscalations: Map<string, Set<number>> = new Map(); // Track escalation levels per case

  static {
    this.initializeDefaultPolicies();
  }

  private static initializeDefaultPolicies(): void {
    // Critical Case Escalation Policy
    this.policies.set('POL-CRITICAL', {
      id: 'POL-CRITICAL',
      name: 'Critical Case Escalation',
      description: 'Escalation policy for critical priority cases',
      triggers: [
        {
          type: 'TIME_BASED',
          condition: 'case.priority === CRITICAL',
          parameters: {}
        },
        {
          type: 'SLA_BREACH',
          condition: 'case.slaBreach === true',
          parameters: {}
        }
      ],
      levels: [
        {
          level: 1,
          name: 'Senior Analyst',
          description: 'Escalate to senior analyst after 30 minutes',
          triggerAfterMinutes: 30,
          assignTo: ['senior-analyst-1', 'senior-analyst-2'],
          notifyChannels: ['email', 'slack'],
          actions: [
            {
              type: 'NOTIFY',
              target: 'case-escalated',
              parameters: { escalationLevel: 1 }
            }
          ],
          autoReassign: true
        },
        {
          level: 2,
          name: 'Team Lead',
          description: 'Escalate to team lead after 1 hour',
          triggerAfterMinutes: 60,
          assignTo: ['team-lead-1', 'team-lead-2'],
          notifyChannels: ['email', 'slack', 'teams'],
          actions: [
            {
              type: 'NOTIFY',
              target: 'case-escalated',
              parameters: { escalationLevel: 2 }
            },
            {
              type: 'REASSIGN',
              target: 'team-lead',
              parameters: {}
            }
          ],
          autoReassign: true
        },
        {
          level: 3,
          name: 'Security Manager',
          description: 'Escalate to security manager after 2 hours',
          triggerAfterMinutes: 120,
          assignTo: ['security-manager'],
          notifyChannels: ['email', 'slack', 'teams', 'pagerduty'],
          actions: [
            {
              type: 'NOTIFY',
              target: 'critical-alert',
              parameters: { escalationLevel: 3 }
            },
            {
              type: 'REASSIGN',
              target: 'security-manager',
              parameters: {}
            }
          ],
          autoReassign: true
        },
        {
          level: 4,
          name: 'Director/CISO',
          description: 'Escalate to executive leadership after 4 hours',
          triggerAfterMinutes: 240,
          assignTo: ['director', 'ciso'],
          notifyChannels: ['email', 'pagerduty', 'sms'],
          actions: [
            {
              type: 'NOTIFY',
              target: 'critical-alert',
              parameters: { escalationLevel: 4 }
            },
            {
              type: 'PRIORITY_INCREASE',
              target: 'escalate-to-ciso',
              parameters: {}
            }
          ],
          autoReassign: false
        }
      ],
      enabled: true,
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        lastModified: '2025-01-01'
      }
    });

    // High Priority Escalation Policy
    this.policies.set('POL-HIGH', {
      id: 'POL-HIGH',
      name: 'High Priority Case Escalation',
      description: 'Escalation policy for high priority cases',
      triggers: [
        {
          type: 'TIME_BASED',
          condition: 'case.priority === HIGH',
          parameters: {}
        }
      ],
      levels: [
        {
          level: 1,
          name: 'Senior Analyst',
          description: 'Escalate to senior analyst after 2 hours',
          triggerAfterMinutes: 120,
          assignTo: ['senior-analyst-1', 'senior-analyst-2'],
          notifyChannels: ['email', 'slack'],
          actions: [
            {
              type: 'NOTIFY',
              target: 'case-escalated',
              parameters: { escalationLevel: 1 }
            }
          ],
          autoReassign: true
        },
        {
          level: 2,
          name: 'Team Lead',
          description: 'Escalate to team lead after 6 hours',
          triggerAfterMinutes: 360,
          assignTo: ['team-lead-1'],
          notifyChannels: ['email', 'slack'],
          actions: [
            {
              type: 'NOTIFY',
              target: 'case-escalated',
              parameters: { escalationLevel: 2 }
            },
            {
              type: 'REASSIGN',
              target: 'team-lead',
              parameters: {}
            }
          ],
          autoReassign: true
        }
      ],
      enabled: true,
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        lastModified: '2025-01-01'
      }
    });

    // SLA Breach Escalation Policy
    this.policies.set('POL-SLA-BREACH', {
      id: 'POL-SLA-BREACH',
      name: 'SLA Breach Escalation',
      description: 'Immediate escalation for SLA breaches',
      triggers: [
        {
          type: 'SLA_BREACH',
          condition: 'case.slaBreach === true',
          parameters: {}
        }
      ],
      levels: [
        {
          level: 1,
          name: 'Immediate Escalation',
          description: 'Immediate escalation on SLA breach',
          triggerAfterMinutes: 0,
          assignTo: ['team-lead', 'security-manager'],
          notifyChannels: ['email', 'slack', 'teams'],
          actions: [
            {
              type: 'NOTIFY',
              target: 'sla-breach',
              parameters: {}
            },
            {
              type: 'PRIORITY_INCREASE',
              target: 'increase-priority',
              parameters: {}
            }
          ],
          autoReassign: true
        }
      ],
      enabled: true,
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        lastModified: '2025-01-01'
      }
    });
  }

  static async checkEscalation(
    caseId: string,
    caseData: {
      priority: string;
      status: string;
      createdAt: string;
      slaBreach?: boolean;
      assignee?: string;
    },
    userId: string = 'SYSTEM'
  ): Promise<void> {
    // Don't escalate closed cases
    if (caseData.status === 'CLOSED') return;

    const caseAge = Date.now() - new Date(caseData.createdAt).getTime();
    const caseAgeMinutes = caseAge / (1000 * 60);

    // Find applicable policies
    const applicablePolicies = Array.from(this.policies.values()).filter(policy => {
      if (!policy.enabled) return false;

      // Check triggers
      return policy.triggers.some(trigger => {
        if (trigger.type === 'TIME_BASED') {
          return trigger.condition.includes(caseData.priority);
        }
        if (trigger.type === 'SLA_BREACH') {
          return caseData.slaBreach === true;
        }
        return false;
      });
    });

    // Check each applicable policy
    for (const policy of applicablePolicies) {
      await this.checkPolicyEscalation(policy, caseId, caseData, caseAgeMinutes, userId);
    }
  }

  private static async checkPolicyEscalation(
    policy: EscalationPolicy,
    caseId: string,
    caseData: any,
    caseAgeMinutes: number,
    userId: string
  ): Promise<void> {
    const caseEscalationLevels = this.caseEscalations.get(caseId) || new Set<number>();

    // Find levels that should be triggered
    for (const level of policy.levels) {
      // Check if this level has already been triggered for this case
      const levelKey = `${policy.id}-${level.level}`;
      if (caseEscalationLevels.has(level.level)) {
        continue;
      }

      // Check if enough time has passed
      if (caseAgeMinutes >= level.triggerAfterMinutes) {
        await this.triggerEscalation(policy, level, caseId, caseData, userId);
        caseEscalationLevels.add(level.level);
      }
    }

    this.caseEscalations.set(caseId, caseEscalationLevels);
  }

  private static async triggerEscalation(
    policy: EscalationPolicy,
    level: EscalationLevel,
    caseId: string,
    caseData: any,
    userId: string
  ): Promise<void> {
    const eventId = `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const event: EscalationEvent = {
      id: eventId,
      policyId: policy.id,
      caseId,
      level: level.level,
      triggeredAt: new Date().toISOString(),
      triggeredBy: userId,
      reason: `${policy.name} - Level ${level.level}: ${level.description}`,
      status: 'TRIGGERED',
      actions: []
    };

    this.events.set(eventId, event);

    logger.info(`Triggering escalation ${eventId} for case ${caseId} - Policy: ${policy.name}, Level: ${level.level}`);

    await AuditService.log(
      userId,
      'ESCALATION_TRIGGERED',
      `Case ${caseId} escalated to level ${level.level}: ${level.name}`,
      caseId
    );

    // Execute escalation actions
    event.status = 'IN_PROGRESS';

    for (const action of level.actions) {
      const actionResult: EscalationActionResult = {
        action,
        status: 'PENDING'
      };

      event.actions.push(actionResult);

      try {
        const output = await this.executeEscalationAction(action, caseId, caseData, level);
        actionResult.status = 'COMPLETED';
        actionResult.output = output;
        actionResult.completedAt = new Date().toISOString();
      } catch (error: any) {
        actionResult.status = 'FAILED';
        actionResult.error = error.message;
        actionResult.completedAt = new Date().toISOString();
        logger.error(`Escalation action failed:`, error);
      }
    }

    event.status = 'COMPLETED';
    event.completedAt = new Date().toISOString();

    logger.info(`Escalation ${eventId} completed`);
  }

  private static async executeEscalationAction(
    action: EscalationAction,
    caseId: string,
    caseData: any,
    level: EscalationLevel
  ): Promise<any> {
    logger.info(`Executing escalation action: ${action.type} for case ${caseId}`);

    switch (action.type) {
      case 'NOTIFY':
        return await this.executeNotifyAction(action, caseId, caseData, level);

      case 'REASSIGN':
        return await this.executeReassignAction(action, caseId, caseData, level);

      case 'PRIORITY_INCREASE':
        return await this.executePriorityIncreaseAction(action, caseId, caseData);

      case 'PLAYBOOK':
        return await this.executePlaybookAction(action, caseId, caseData);

      case 'CUSTOM':
        return await this.executeCustomAction(action, caseId, caseData);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private static async executeNotifyAction(
    action: EscalationAction,
    caseId: string,
    caseData: any,
    level: EscalationLevel
  ): Promise<any> {
    const variables = {
      caseId,
      title: caseData.title || 'Case',
      priority: caseData.priority,
      assignee: caseData.assignee || 'Unassigned',
      escalationLevel: level.level,
      escalatedTo: level.assignTo.join(', '),
      reason: level.description,
      caseUrl: `https://sentinel.local/cases/${caseId}`,
      ...action.parameters
    };

    const notificationId = await NotificationService.sendNotification(
      action.target,
      level.assignTo,
      variables,
      { caseId, eventType: 'ESCALATION' }
    );

    return { notificationId, sentTo: level.assignTo };
  }

  private static async executeReassignAction(
    action: EscalationAction,
    caseId: string,
    caseData: any,
    level: EscalationLevel
  ): Promise<any> {
    // In production, this would call CaseService.update()
    const newAssignee = level.assignTo[0]; // Assign to first person in list

    logger.info(`Reassigning case ${caseId} to ${newAssignee}`);

    return {
      reassigned: true,
      from: caseData.assignee,
      to: newAssignee,
      timestamp: new Date().toISOString()
    };
  }

  private static async executePriorityIncreaseAction(
    action: EscalationAction,
    caseId: string,
    caseData: any
  ): Promise<any> {
    const priorityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const currentIndex = priorityLevels.indexOf(caseData.priority);
    const newPriority = currentIndex < priorityLevels.length - 1
      ? priorityLevels[currentIndex + 1]
      : caseData.priority;

    // In production, this would call CaseService.update()
    logger.info(`Increasing case ${caseId} priority from ${caseData.priority} to ${newPriority}`);

    return {
      priorityIncreased: true,
      from: caseData.priority,
      to: newPriority,
      timestamp: new Date().toISOString()
    };
  }

  private static async executePlaybookAction(
    action: EscalationAction,
    caseId: string,
    caseData: any
  ): Promise<any> {
    // In production, this would call PlaybookRunner.executePlaybook()
    logger.info(`Executing playbook ${action.target} for case ${caseId}`);

    return {
      playbookExecuted: true,
      playbookId: action.target,
      executionId: `EXEC-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  private static async executeCustomAction(
    action: EscalationAction,
    caseId: string,
    caseData: any
  ): Promise<any> {
    logger.info(`Executing custom action ${action.target} for case ${caseId}`);

    // Custom action implementation would go here
    return {
      customActionExecuted: true,
      action: action.target,
      timestamp: new Date().toISOString()
    };
  }

  static async manualEscalation(
    caseId: string,
    policyId: string,
    levelNumber: number,
    userId: string,
    reason?: string
  ): Promise<string> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error(`Policy ${policyId} not found`);
    }

    const level = policy.levels.find(l => l.level === levelNumber);
    if (!level) {
      throw new Error(`Level ${levelNumber} not found in policy ${policyId}`);
    }

    // Trigger escalation manually
    const eventId = `ESC-MANUAL-${Date.now()}`;
    await this.triggerEscalation(policy, level, caseId, { priority: 'HIGH' }, userId);

    await AuditService.log(
      userId,
      'MANUAL_ESCALATION',
      `Manual escalation of case ${caseId} to level ${levelNumber}: ${reason || 'No reason provided'}`,
      caseId
    );

    return eventId;
  }

  static getPolicy(policyId: string): EscalationPolicy | undefined {
    return this.policies.get(policyId);
  }

  static getAllPolicies(): EscalationPolicy[] {
    return Array.from(this.policies.values());
  }

  static getEvent(eventId: string): EscalationEvent | undefined {
    return this.events.get(eventId);
  }

  static getCaseEscalations(caseId: string): EscalationEvent[] {
    return Array.from(this.events.values())
      .filter(e => e.caseId === caseId)
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
  }

  static async resetCaseEscalation(caseId: string): Promise<void> {
    this.caseEscalations.delete(caseId);
    logger.info(`Reset escalation tracking for case ${caseId}`);
  }

  static async updatePolicy(policyId: string, updates: Partial<EscalationPolicy>): Promise<void> {
    const policy = this.policies.get(policyId);
    if (!policy) throw new Error('Policy not found');

    Object.assign(policy, updates);
    policy.metadata.lastModified = new Date().toISOString();

    logger.info(`Updated escalation policy ${policyId}`);
  }

  static async togglePolicy(policyId: string, enabled: boolean): Promise<void> {
    const policy = this.policies.get(policyId);
    if (!policy) throw new Error('Policy not found');

    policy.enabled = enabled;
    logger.info(`Escalation policy ${policyId} ${enabled ? 'enabled' : 'disabled'}`);
  }
}
