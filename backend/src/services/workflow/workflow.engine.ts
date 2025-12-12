
import { AuditService } from '../audit.service';
import { logger } from '../../utils/logger';

export interface WorkflowState {
  id: string;
  name: string;
  type: 'START' | 'INTERMEDIATE' | 'END' | 'DECISION' | 'PARALLEL' | 'SUBPROCESS';
  description?: string;
  transitions: WorkflowTransition[];
  actions?: WorkflowAction[];
  validations?: WorkflowValidation[];
  metadata?: Record<string, any>;
}

export interface WorkflowTransition {
  id: string;
  name: string;
  targetStateId: string;
  condition?: string; // JavaScript expression
  requiresApproval?: boolean;
  approvalRoles?: string[];
  automated?: boolean;
}

export interface WorkflowAction {
  type: 'SCRIPT' | 'NOTIFICATION' | 'ASSIGNMENT' | 'STATUS_UPDATE' | 'CUSTOM';
  target: string;
  parameters: Record<string, any>;
  runOn: 'ENTRY' | 'EXIT' | 'BOTH';
}

export interface WorkflowValidation {
  field: string;
  rule: string;
  errorMessage: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  entityType: 'CASE' | 'THREAT' | 'INCIDENT' | 'INVESTIGATION';
  states: WorkflowState[];
  initialStateId: string;
  variables: WorkflowVariable[];
  metadata: {
    createdBy: string;
    createdAt: string;
    lastModified: string;
    tags: string[];
  };
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: any;
  required?: boolean;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  entityId: string;
  entityType: string;
  currentStateId: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  variables: Map<string, any>;
  history: WorkflowHistoryEntry[];
  startedAt: string;
  startedBy: string;
  completedAt?: string;
  error?: string;
}

export interface WorkflowHistoryEntry {
  id: string;
  timestamp: string;
  fromStateId?: string;
  toStateId: string;
  transitionId?: string;
  userId: string;
  action: string;
  metadata?: Record<string, any>;
}

export class WorkflowEngine {
  private static workflows: Map<string, WorkflowDefinition> = new Map();
  private static instances: Map<string, WorkflowInstance> = new Map();

  static registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
    logger.info(`Registered workflow: ${workflow.name} (${workflow.id})`);
  }

  static async startWorkflow(
    workflowId: string,
    entityId: string,
    entityType: string,
    userId: string,
    initialVariables?: Record<string, any>
  ): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.entityType !== entityType) {
      throw new Error(`Workflow ${workflowId} is not compatible with entity type ${entityType}`);
    }

    const instanceId = `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Initialize variables
    const variables = new Map<string, any>();
    workflow.variables.forEach(v => {
      if (initialVariables && initialVariables[v.name] !== undefined) {
        variables.set(v.name, initialVariables[v.name]);
      } else if (v.defaultValue !== undefined) {
        variables.set(v.name, v.defaultValue);
      } else if (v.required) {
        throw new Error(`Required variable ${v.name} not provided`);
      }
    });

    const instance: WorkflowInstance = {
      id: instanceId,
      workflowId,
      entityId,
      entityType,
      currentStateId: workflow.initialStateId,
      status: 'ACTIVE',
      variables,
      history: [{
        id: `HIST-${Date.now()}`,
        timestamp: new Date().toISOString(),
        toStateId: workflow.initialStateId,
        userId,
        action: 'WORKFLOW_STARTED'
      }],
      startedAt: new Date().toISOString(),
      startedBy: userId
    };

    this.instances.set(instanceId, instance);

    await AuditService.log(
      userId,
      'WORKFLOW_STARTED',
      `Started workflow ${workflow.name} for ${entityType} ${entityId}`,
      entityId
    );

    // Execute entry actions for initial state
    const initialState = workflow.states.find(s => s.id === workflow.initialStateId);
    if (initialState) {
      await this.executeStateActions(instance, initialState, 'ENTRY');
    }

    logger.info(`Started workflow instance ${instanceId} for ${entityType} ${entityId}`);

    return instanceId;
  }

  static async transitionWorkflow(
    instanceId: string,
    transitionId: string,
    userId: string,
    context?: Record<string, any>
  ): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance ${instanceId} not found`);
    }

    if (instance.status !== 'ACTIVE') {
      throw new Error(`Cannot transition workflow in ${instance.status} status`);
    }

    const workflow = this.workflows.get(instance.workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${instance.workflowId} not found`);
    }

    const currentState = workflow.states.find(s => s.id === instance.currentStateId);
    if (!currentState) {
      throw new Error(`Current state ${instance.currentStateId} not found`);
    }

    const transition = currentState.transitions.find(t => t.id === transitionId);
    if (!transition) {
      throw new Error(`Transition ${transitionId} not available from state ${currentState.name}`);
    }

    // Check conditions
    if (transition.condition) {
      const conditionMet = this.evaluateCondition(transition.condition, instance, context);
      if (!conditionMet) {
        throw new Error(`Transition condition not met: ${transition.condition}`);
      }
    }

    // Check approval requirements
    if (transition.requiresApproval) {
      // In production, this would check approval status
      logger.info(`Transition ${transitionId} requires approval from roles: ${transition.approvalRoles?.join(', ')}`);
    }

    const targetState = workflow.states.find(s => s.id === transition.targetStateId);
    if (!targetState) {
      throw new Error(`Target state ${transition.targetStateId} not found`);
    }

    // Execute exit actions for current state
    await this.executeStateActions(instance, currentState, 'EXIT');

    // Perform transition
    const oldStateId = instance.currentStateId;
    instance.currentStateId = transition.targetStateId;

    instance.history.push({
      id: `HIST-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromStateId: oldStateId,
      toStateId: transition.targetStateId,
      transitionId,
      userId,
      action: 'STATE_TRANSITION',
      metadata: context
    });

    await AuditService.log(
      userId,
      'WORKFLOW_TRANSITION',
      `Workflow ${instanceId} transitioned from ${currentState.name} to ${targetState.name}`,
      instance.entityId
    );

    // Execute entry actions for new state
    await this.executeStateActions(instance, targetState, 'ENTRY');

    // Check if workflow completed
    if (targetState.type === 'END') {
      instance.status = 'COMPLETED';
      instance.completedAt = new Date().toISOString();

      await AuditService.log(
        userId,
        'WORKFLOW_COMPLETED',
        `Workflow ${instanceId} completed`,
        instance.entityId
      );

      logger.info(`Workflow instance ${instanceId} completed`);
    }

    logger.info(`Workflow ${instanceId} transitioned from ${currentState.name} to ${targetState.name}`);
  }

  private static async executeStateActions(
    instance: WorkflowInstance,
    state: WorkflowState,
    timing: 'ENTRY' | 'EXIT'
  ): Promise<void> {
    if (!state.actions) return;

    const actions = state.actions.filter(a => a.runOn === timing || a.runOn === 'BOTH');

    for (const action of actions) {
      try {
        await this.executeAction(instance, action);
      } catch (error: any) {
        logger.error(`Action execution failed:`, error);
        // Don't fail the workflow on action errors - log and continue
      }
    }
  }

  private static async executeAction(instance: WorkflowInstance, action: WorkflowAction): Promise<void> {
    logger.info(`Executing workflow action: ${action.type} - ${action.target}`);

    switch (action.type) {
      case 'SCRIPT':
        await this.executeScriptAction(instance, action);
        break;
      case 'NOTIFICATION':
        await this.executeNotificationAction(instance, action);
        break;
      case 'ASSIGNMENT':
        await this.executeAssignmentAction(instance, action);
        break;
      case 'STATUS_UPDATE':
        await this.executeStatusUpdateAction(instance, action);
        break;
      case 'CUSTOM':
        await this.executeCustomAction(instance, action);
        break;
    }
  }

  private static async executeScriptAction(instance: WorkflowInstance, action: WorkflowAction): Promise<void> {
    // In production, this would execute a sandboxed script
    logger.info(`Executing script: ${action.target}`);
    // Simulate script execution
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private static async executeNotificationAction(instance: WorkflowInstance, action: WorkflowAction): Promise<void> {
    logger.info(`Sending notification: ${action.target}`);
    // In production, this would call NotificationService
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private static async executeAssignmentAction(instance: WorkflowInstance, action: WorkflowAction): Promise<void> {
    logger.info(`Assigning to: ${action.parameters.assignee}`);
    // In production, this would update entity assignment
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private static async executeStatusUpdateAction(instance: WorkflowInstance, action: WorkflowAction): Promise<void> {
    logger.info(`Updating status to: ${action.parameters.status}`);
    // In production, this would update entity status
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private static async executeCustomAction(instance: WorkflowInstance, action: WorkflowAction): Promise<void> {
    logger.info(`Executing custom action: ${action.target}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private static evaluateCondition(
    condition: string,
    instance: WorkflowInstance,
    context?: Record<string, any>
  ): boolean {
    // Simple condition evaluation - in production, use a proper expression evaluator
    try {
      // Create evaluation context
      const evalContext = {
        variables: Object.fromEntries(instance.variables),
        context: context || {},
        entityId: instance.entityId,
        entityType: instance.entityType
      };

      // Simple pattern matching for common conditions
      if (condition.includes('priority')) {
        const priority = evalContext.variables.priority || evalContext.context.priority;
        if (condition.includes('CRITICAL')) return priority === 'CRITICAL';
        if (condition.includes('HIGH')) return priority === 'HIGH';
      }

      if (condition.includes('status')) {
        const status = evalContext.variables.status || evalContext.context.status;
        return condition.includes(status);
      }

      // Default to true for simple conditions
      return true;
    } catch (error) {
      logger.error('Condition evaluation error:', error);
      return false;
    }
  }

  static async setVariable(instanceId: string, name: string, value: any, userId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance ${instanceId} not found`);
    }

    const oldValue = instance.variables.get(name);
    instance.variables.set(name, value);

    instance.history.push({
      id: `HIST-${Date.now()}`,
      timestamp: new Date().toISOString(),
      toStateId: instance.currentStateId,
      userId,
      action: 'VARIABLE_SET',
      metadata: { variable: name, oldValue, newValue: value }
    });

    logger.info(`Set workflow variable ${name} = ${value} for instance ${instanceId}`);
  }

  static async pauseWorkflow(instanceId: string, userId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance ${instanceId} not found`);
    }

    instance.status = 'PAUSED';

    instance.history.push({
      id: `HIST-${Date.now()}`,
      timestamp: new Date().toISOString(),
      toStateId: instance.currentStateId,
      userId,
      action: 'WORKFLOW_PAUSED'
    });

    await AuditService.log(userId, 'WORKFLOW_PAUSED', `Paused workflow ${instanceId}`, instance.entityId);
    logger.info(`Paused workflow instance ${instanceId}`);
  }

  static async resumeWorkflow(instanceId: string, userId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance ${instanceId} not found`);
    }

    if (instance.status !== 'PAUSED') {
      throw new Error(`Can only resume paused workflows`);
    }

    instance.status = 'ACTIVE';

    instance.history.push({
      id: `HIST-${Date.now()}`,
      timestamp: new Date().toISOString(),
      toStateId: instance.currentStateId,
      userId,
      action: 'WORKFLOW_RESUMED'
    });

    await AuditService.log(userId, 'WORKFLOW_RESUMED', `Resumed workflow ${instanceId}`, instance.entityId);
    logger.info(`Resumed workflow instance ${instanceId}`);
  }

  static async cancelWorkflow(instanceId: string, userId: string, reason?: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance ${instanceId} not found`);
    }

    instance.status = 'CANCELLED';
    instance.completedAt = new Date().toISOString();
    instance.error = reason;

    instance.history.push({
      id: `HIST-${Date.now()}`,
      timestamp: new Date().toISOString(),
      toStateId: instance.currentStateId,
      userId,
      action: 'WORKFLOW_CANCELLED',
      metadata: { reason }
    });

    await AuditService.log(
      userId,
      'WORKFLOW_CANCELLED',
      `Cancelled workflow ${instanceId}${reason ? `: ${reason}` : ''}`,
      instance.entityId
    );

    logger.info(`Cancelled workflow instance ${instanceId}`);
  }

  static getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  static getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  static getInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId);
  }

  static getEntityWorkflows(entityId: string): WorkflowInstance[] {
    return Array.from(this.instances.values())
      .filter(i => i.entityId === entityId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  static getAvailableTransitions(instanceId: string): WorkflowTransition[] {
    const instance = this.instances.get(instanceId);
    if (!instance) return [];

    const workflow = this.workflows.get(instance.workflowId);
    if (!workflow) return [];

    const currentState = workflow.states.find(s => s.id === instance.currentStateId);
    return currentState?.transitions || [];
  }

  static getCurrentState(instanceId: string): WorkflowState | undefined {
    const instance = this.instances.get(instanceId);
    if (!instance) return undefined;

    const workflow = this.workflows.get(instance.workflowId);
    if (!workflow) return undefined;

    return workflow.states.find(s => s.id === instance.currentStateId);
  }
}
