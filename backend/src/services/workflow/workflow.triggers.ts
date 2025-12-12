
import { WorkflowEngine } from './workflow.engine';
import { AuditService } from '../audit.service';
import { logger } from '../../utils/logger';

export interface TriggerRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  eventType: string;
  conditions: TriggerCondition[];
  action: TriggerAction;
  metadata: {
    createdBy: string;
    createdAt: string;
    lastTriggered?: string;
    triggerCount: number;
  };
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface TriggerAction {
  type: 'START_WORKFLOW' | 'TRANSITION_WORKFLOW' | 'NOTIFICATION' | 'CUSTOM';
  target: string;
  parameters: Record<string, any>;
}

export class WorkflowTriggers {
  private static rules: Map<string, TriggerRule> = new Map();

  static {
    this.initializeDefaultTriggers();
  }

  private static initializeDefaultTriggers(): void {
    // Auto-start case investigation workflow for new cases
    this.addTriggerRule({
      id: 'TRIG-CASE-AUTO-START',
      name: 'Auto-Start Case Investigation',
      description: 'Automatically start investigation workflow for new cases',
      enabled: true,
      eventType: 'CASE_CREATED',
      conditions: [
        { field: 'priority', operator: 'in', value: ['MEDIUM', 'HIGH', 'CRITICAL'] }
      ],
      action: {
        type: 'START_WORKFLOW',
        target: 'WF-CASE-INVESTIGATION',
        parameters: {}
      },
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        triggerCount: 0
      }
    });

    // Auto-start incident response for critical threats
    this.addTriggerRule({
      id: 'TRIG-CRITICAL-INCIDENT',
      name: 'Critical Threat Incident Response',
      description: 'Start incident response workflow for critical threats',
      enabled: true,
      eventType: 'THREAT_DETECTED',
      conditions: [
        { field: 'severity', operator: 'equals', value: 'CRITICAL' },
        { field: 'confidence', operator: 'greater_than', value: 80 }
      ],
      action: {
        type: 'START_WORKFLOW',
        target: 'WF-INCIDENT-RESPONSE',
        parameters: { autoEscalate: true }
      },
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        triggerCount: 0
      }
    });

    // Auto-escalate cases on SLA breach
    this.addTriggerRule({
      id: 'TRIG-SLA-BREACH',
      name: 'SLA Breach Auto-Escalation',
      description: 'Escalate case workflow when SLA is breached',
      enabled: true,
      eventType: 'SLA_BREACH',
      conditions: [],
      action: {
        type: 'TRANSITION_WORKFLOW',
        target: 'INCIDENT_ESCALATION',
        parameters: { reason: 'SLA_BREACH' }
      },
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        triggerCount: 0
      }
    });

    // Auto-start malware analysis for malware detections
    this.addTriggerRule({
      id: 'TRIG-MALWARE-ANALYSIS',
      name: 'Malware Auto-Analysis',
      description: 'Start malware analysis workflow for malware samples',
      enabled: true,
      eventType: 'MALWARE_DETECTED',
      conditions: [
        { field: 'type', operator: 'equals', value: 'malware' }
      ],
      action: {
        type: 'START_WORKFLOW',
        target: 'WF-MALWARE-ANALYSIS',
        parameters: { priority: 'HIGH' }
      },
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        triggerCount: 0
      }
    });

    // Auto-transition to containment for confirmed incidents
    this.addTriggerRule({
      id: 'TRIG-INCIDENT-CONFIRMED',
      name: 'Incident Confirmation Transition',
      description: 'Auto-transition to containment when incident is confirmed',
      enabled: true,
      eventType: 'INCIDENT_CONFIRMED',
      conditions: [
        { field: 'status', operator: 'equals', value: 'CONFIRMED' }
      ],
      action: {
        type: 'TRANSITION_WORKFLOW',
        target: 'CONTAINMENT',
        parameters: {}
      },
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        triggerCount: 0
      }
    });

    // Auto-start threat intel processing
    this.addTriggerRule({
      id: 'TRIG-INTEL-INGEST',
      name: 'Threat Intel Auto-Processing',
      description: 'Start threat intelligence workflow for new intel',
      enabled: true,
      eventType: 'INTEL_RECEIVED',
      conditions: [
        { field: 'source', operator: 'in', value: ['OSINT', 'ISAC', 'COMMERCIAL'] }
      ],
      action: {
        type: 'START_WORKFLOW',
        target: 'WF-THREAT-INTEL',
        parameters: {}
      },
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        triggerCount: 0
      }
    });

    // Notify on high-priority case transitions
    this.addTriggerRule({
      id: 'TRIG-HIGH-PRIORITY-NOTIFY',
      name: 'High Priority Case Notification',
      description: 'Send notification when high priority case changes state',
      enabled: true,
      eventType: 'CASE_TRANSITION',
      conditions: [
        { field: 'priority', operator: 'in', value: ['HIGH', 'CRITICAL'] }
      ],
      action: {
        type: 'NOTIFICATION',
        target: 'case-transition',
        parameters: { channels: ['email', 'slack'] }
      },
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        triggerCount: 0
      }
    });

    // Auto-close low priority cases after extended period
    this.addTriggerRule({
      id: 'TRIG-AUTO-CLOSE-STALE',
      name: 'Auto-Close Stale Cases',
      description: 'Automatically close low priority cases with no activity',
      enabled: true,
      eventType: 'CASE_STALE',
      conditions: [
        { field: 'priority', operator: 'equals', value: 'LOW' },
        { field: 'daysInactive', operator: 'greater_than', value: 30 }
      ],
      action: {
        type: 'TRANSITION_WORKFLOW',
        target: 'CLOSED',
        parameters: { reason: 'AUTO_CLOSED_STALE' }
      },
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        triggerCount: 0
      }
    });
  }

  static async processEvent(
    eventType: string,
    entityId: string,
    entityType: string,
    eventData: Record<string, any>,
    userId: string = 'SYSTEM'
  ): Promise<void> {
    logger.info(`Processing event: ${eventType} for ${entityType} ${entityId}`);

    // Find matching trigger rules
    const matchingRules = Array.from(this.rules.values()).filter(rule => {
      if (!rule.enabled) return false;
      if (rule.eventType !== eventType) return false;

      // Check all conditions
      return rule.conditions.every(condition =>
        this.evaluateCondition(condition, eventData)
      );
    });

    // Execute matching triggers
    for (const rule of matchingRules) {
      try {
        await this.executeTrigger(rule, entityId, entityType, eventData, userId);

        rule.metadata.triggerCount++;
        rule.metadata.lastTriggered = new Date().toISOString();

        await AuditService.log(
          userId,
          'TRIGGER_EXECUTED',
          `Trigger ${rule.name} executed for ${eventType}`,
          entityId
        );

        logger.info(`Executed trigger: ${rule.name} (${rule.id})`);
      } catch (error: any) {
        logger.error(`Trigger execution failed for ${rule.name}:`, error);
      }
    }
  }

  private static evaluateCondition(condition: TriggerCondition, data: Record<string, any>): boolean {
    const fieldValue = this.getNestedValue(data, condition.field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;

      case 'not_equals':
        return fieldValue !== condition.value;

      case 'contains':
        if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
          return fieldValue.includes(condition.value);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(condition.value);
        }
        return false;

      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);

      case 'less_than':
        return Number(fieldValue) < Number(condition.value);

      case 'in':
        if (Array.isArray(condition.value)) {
          return condition.value.includes(fieldValue);
        }
        return false;

      case 'not_in':
        if (Array.isArray(condition.value)) {
          return !condition.value.includes(fieldValue);
        }
        return false;

      default:
        logger.warn(`Unknown operator: ${condition.operator}`);
        return false;
    }
  }

  private static getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static async executeTrigger(
    rule: TriggerRule,
    entityId: string,
    entityType: string,
    eventData: Record<string, any>,
    userId: string
  ): Promise<void> {
    logger.info(`Executing trigger action: ${rule.action.type} - ${rule.action.target}`);

    switch (rule.action.type) {
      case 'START_WORKFLOW':
        await this.executeStartWorkflow(rule.action, entityId, entityType, eventData, userId);
        break;

      case 'TRANSITION_WORKFLOW':
        await this.executeTransitionWorkflow(rule.action, entityId, eventData, userId);
        break;

      case 'NOTIFICATION':
        await this.executeNotification(rule.action, entityId, eventData, userId);
        break;

      case 'CUSTOM':
        await this.executeCustomAction(rule.action, entityId, eventData, userId);
        break;

      default:
        logger.warn(`Unknown trigger action type: ${rule.action.type}`);
    }
  }

  private static async executeStartWorkflow(
    action: TriggerAction,
    entityId: string,
    entityType: string,
    eventData: Record<string, any>,
    userId: string
  ): Promise<void> {
    // Check if workflow already started for this entity
    const existingWorkflows = WorkflowEngine.getEntityWorkflows(entityId);
    const alreadyStarted = existingWorkflows.some(w =>
      w.workflowId === action.target && w.status === 'ACTIVE'
    );

    if (alreadyStarted) {
      logger.info(`Workflow ${action.target} already active for ${entityId}, skipping`);
      return;
    }

    // Merge event data into initial variables
    const initialVariables = {
      ...eventData,
      ...action.parameters,
      triggeredBy: 'AUTO_TRIGGER'
    };

    const instanceId = await WorkflowEngine.startWorkflow(
      action.target,
      entityId,
      entityType,
      userId,
      initialVariables
    );

    logger.info(`Started workflow ${action.target} (${instanceId}) for ${entityId}`);
  }

  private static async executeTransitionWorkflow(
    action: TriggerAction,
    entityId: string,
    eventData: Record<string, any>,
    userId: string
  ): Promise<void> {
    // Find active workflow for this entity
    const workflows = WorkflowEngine.getEntityWorkflows(entityId);
    const activeWorkflow = workflows.find(w => w.status === 'ACTIVE');

    if (!activeWorkflow) {
      logger.warn(`No active workflow found for ${entityId}, cannot transition`);
      return;
    }

    // Find transition to target state
    const availableTransitions = WorkflowEngine.getAvailableTransitions(activeWorkflow.id);
    const transition = availableTransitions.find(t => t.targetStateId === action.target);

    if (!transition) {
      logger.warn(`No transition available to state ${action.target}`);
      return;
    }

    await WorkflowEngine.transitionWorkflow(
      activeWorkflow.id,
      transition.id,
      userId,
      { ...eventData, ...action.parameters }
    );

    logger.info(`Transitioned workflow ${activeWorkflow.id} to state ${action.target}`);
  }

  private static async executeNotification(
    action: TriggerAction,
    entityId: string,
    eventData: Record<string, any>,
    userId: string
  ): Promise<void> {
    // In production, this would call NotificationService
    logger.info(`Sending notification: ${action.target} for ${entityId}`);

    // Simulate notification
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private static async executeCustomAction(
    action: TriggerAction,
    entityId: string,
    eventData: Record<string, any>,
    userId: string
  ): Promise<void> {
    logger.info(`Executing custom action: ${action.target} for ${entityId}`);

    // Custom action implementation would go here
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  static addTriggerRule(rule: TriggerRule): void {
    this.rules.set(rule.id, rule);
    logger.info(`Added trigger rule: ${rule.name} (${rule.id})`);
  }

  static removeTriggerRule(ruleId: string): void {
    this.rules.delete(ruleId);
    logger.info(`Removed trigger rule: ${ruleId}`);
  }

  static getTriggerRule(ruleId: string): TriggerRule | undefined {
    return this.rules.get(ruleId);
  }

  static getAllTriggerRules(): TriggerRule[] {
    return Array.from(this.rules.values());
  }

  static getTriggerRulesByEvent(eventType: string): TriggerRule[] {
    return Array.from(this.rules.values()).filter(r => r.eventType === eventType);
  }

  static async enableTriggerRule(ruleId: string): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error('Trigger rule not found');

    rule.enabled = true;
    logger.info(`Enabled trigger rule: ${rule.name}`);
  }

  static async disableTriggerRule(ruleId: string): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error('Trigger rule not found');

    rule.enabled = false;
    logger.info(`Disabled trigger rule: ${rule.name}`);
  }

  static async updateTriggerRule(ruleId: string, updates: Partial<TriggerRule>): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error('Trigger rule not found');

    Object.assign(rule, updates);
    logger.info(`Updated trigger rule: ${rule.name}`);
  }

  // Simulate event for testing
  static async simulateEvent(
    eventType: string,
    entityId: string,
    entityType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    logger.info(`Simulating event: ${eventType}`);
    await this.processEvent(eventType, entityId, entityType, eventData, 'SIMULATOR');
  }
}
