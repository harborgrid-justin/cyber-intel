
import { AuditService } from '../audit.service';
import { logger } from '../../utils/logger';

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  type: 'RECURRING' | 'ONE_TIME' | 'DELAYED';
  schedule?: string; // Cron expression for recurring tasks
  executeAt?: string; // ISO timestamp for one-time tasks
  delayMs?: number; // Delay in milliseconds for delayed tasks
  action: TaskAction;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  failureCount: number;
  metadata: {
    createdBy: string;
    createdAt: string;
    caseId?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
}

export interface TaskAction {
  type: 'PLAYBOOK' | 'NOTIFICATION' | 'SLA_CHECK' | 'ESCALATION' | 'CUSTOM';
  target: string; // Playbook ID, notification template, etc.
  parameters: Record<string, any>;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  output?: any;
  error?: string;
}

export class TaskScheduler {
  private static tasks: Map<string, ScheduledTask> = new Map();
  private static executions: Map<string, TaskExecution> = new Map();
  private static timers: Map<string, NodeJS.Timeout> = new Map();
  private static isRunning: boolean = false;

  static async initialize(): Promise<void> {
    if (this.isRunning) {
      logger.warn('TaskScheduler already running');
      return;
    }

    this.isRunning = true;
    logger.info('TaskScheduler initialized');

    // Register default tasks
    this.registerDefaultTasks();

    // Start scheduler loop
    this.scheduleNextTasks();
  }

  private static registerDefaultTasks(): void {
    // SLA Monitoring Task
    this.scheduleTask({
      id: 'TASK-SLA-MONITOR',
      name: 'SLA Monitoring',
      description: 'Check all open cases for SLA breaches',
      type: 'RECURRING',
      schedule: '*/15 * * * *', // Every 15 minutes
      action: {
        type: 'SLA_CHECK',
        target: 'all_cases',
        parameters: {}
      },
      enabled: true,
      runCount: 0,
      failureCount: 0,
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: new Date().toISOString(),
        priority: 'HIGH'
      }
    });

    // Daily Summary Notification
    this.scheduleTask({
      id: 'TASK-DAILY-SUMMARY',
      name: 'Daily Security Summary',
      description: 'Send daily summary of security events',
      type: 'RECURRING',
      schedule: '0 9 * * *', // Every day at 9 AM
      action: {
        type: 'NOTIFICATION',
        target: 'daily-summary-template',
        parameters: { channels: ['email', 'slack'] }
      },
      enabled: true,
      runCount: 0,
      failureCount: 0,
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: new Date().toISOString(),
        priority: 'LOW'
      }
    });

    // Critical Case Escalation Check
    this.scheduleTask({
      id: 'TASK-CRITICAL-ESCALATION',
      name: 'Critical Case Escalation Check',
      description: 'Check critical cases for escalation',
      type: 'RECURRING',
      schedule: '*/5 * * * *', // Every 5 minutes
      action: {
        type: 'ESCALATION',
        target: 'critical_cases',
        parameters: { priority: 'CRITICAL' }
      },
      enabled: true,
      runCount: 0,
      failureCount: 0,
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: new Date().toISOString(),
        priority: 'CRITICAL'
      }
    });
  }

  static scheduleTask(task: ScheduledTask): string {
    this.tasks.set(task.id, task);

    // Calculate next run time
    if (task.type === 'RECURRING' && task.schedule) {
      task.nextRun = this.calculateNextRun(task.schedule);
    } else if (task.type === 'ONE_TIME' && task.executeAt) {
      task.nextRun = task.executeAt;
    } else if (task.type === 'DELAYED' && task.delayMs) {
      task.nextRun = new Date(Date.now() + task.delayMs).toISOString();
    }

    logger.info(`Scheduled task: ${task.name} (${task.id}), next run: ${task.nextRun}`);

    // Set up timer for immediate scheduling
    this.setupTaskTimer(task);

    return task.id;
  }

  private static setupTaskTimer(task: ScheduledTask): void {
    if (!task.enabled || !task.nextRun) return;

    const nextRunTime = new Date(task.nextRun).getTime();
    const now = Date.now();
    const delay = Math.max(0, nextRunTime - now);

    // Clear existing timer if any
    const existingTimer = this.timers.get(task.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.executeTask(task.id);
    }, delay);

    this.timers.set(task.id, timer);
  }

  private static async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || !task.enabled) return;

    const executionId = `EXEC-${taskId}-${Date.now()}`;
    const execution: TaskExecution = {
      id: executionId,
      taskId,
      status: 'RUNNING',
      startedAt: new Date().toISOString()
    };

    this.executions.set(executionId, execution);
    task.runCount++;
    task.lastRun = new Date().toISOString();

    logger.info(`Executing task: ${task.name} (${taskId})`);

    try {
      const output = await this.performTaskAction(task.action, task.metadata);

      execution.status = 'COMPLETED';
      execution.output = output;
      execution.completedAt = new Date().toISOString();

      await AuditService.log(
        'SYSTEM',
        'TASK_EXECUTED',
        `Task ${task.name} executed successfully`,
        task.metadata.caseId || taskId
      );

      logger.info(`Task ${task.name} completed successfully`);

    } catch (error: any) {
      execution.status = 'FAILED';
      execution.error = error.message;
      execution.completedAt = new Date().toISOString();
      task.failureCount++;

      logger.error(`Task ${task.name} failed:`, error);

      await AuditService.log(
        'SYSTEM',
        'TASK_FAILED',
        `Task ${task.name} failed: ${error.message}`,
        task.metadata.caseId || taskId
      );
    }

    // Schedule next run for recurring tasks
    if (task.type === 'RECURRING' && task.schedule) {
      task.nextRun = this.calculateNextRun(task.schedule);
      this.setupTaskTimer(task);
    } else {
      // Disable one-time tasks after execution
      task.enabled = false;
    }
  }

  private static async performTaskAction(action: TaskAction, metadata: ScheduledTask['metadata']): Promise<any> {
    switch (action.type) {
      case 'SLA_CHECK':
        return await this.performSLACheck(action.parameters);

      case 'NOTIFICATION':
        return await this.performNotification(action.target, action.parameters);

      case 'ESCALATION':
        return await this.performEscalation(action.parameters);

      case 'PLAYBOOK':
        return await this.performPlaybookExecution(action.target, action.parameters);

      case 'CUSTOM':
        return await this.performCustomAction(action.target, action.parameters);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private static async performSLACheck(params: Record<string, any>): Promise<any> {
    logger.info('Performing SLA check...');

    // In production, this would call CaseService.checkAllSLAs()
    const result = {
      checked: Date.now(),
      casesChecked: 0,
      breaches: 0,
      escalations: 0
    };

    // Simulate SLA checking
    await new Promise(resolve => setTimeout(resolve, 1000));

    return result;
  }

  private static async performNotification(template: string, params: Record<string, any>): Promise<any> {
    logger.info(`Sending notification using template: ${template}`);

    const result = {
      sent: true,
      channels: params.channels || [],
      timestamp: new Date().toISOString()
    };

    // Simulate notification
    await new Promise(resolve => setTimeout(resolve, 500));

    return result;
  }

  private static async performEscalation(params: Record<string, any>): Promise<any> {
    logger.info('Performing escalation check...');

    const result = {
      casesEscalated: 0,
      notificationsSent: 0,
      priority: params.priority || 'HIGH'
    };

    // Simulate escalation check
    await new Promise(resolve => setTimeout(resolve, 800));

    return result;
  }

  private static async performPlaybookExecution(playbookId: string, params: Record<string, any>): Promise<any> {
    logger.info(`Executing playbook: ${playbookId}`);

    // In production, this would call PlaybookRunner.executePlaybook()
    const result = {
      playbookId,
      executionId: `EXEC-${Date.now()}`,
      status: 'COMPLETED'
    };

    await new Promise(resolve => setTimeout(resolve, 2000));

    return result;
  }

  private static async performCustomAction(target: string, params: Record<string, any>): Promise<any> {
    logger.info(`Executing custom action: ${target}`);

    // Custom action logic would go here
    const result = {
      action: target,
      executed: true,
      timestamp: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    return result;
  }

  private static scheduleNextTasks(): void {
    // This method sets up timers for all enabled tasks
    this.tasks.forEach(task => {
      if (task.enabled && task.nextRun) {
        this.setupTaskTimer(task);
      }
    });
  }

  private static calculateNextRun(cronExpression: string): string {
    // Simple cron parser - in production, use a library like node-cron
    // For now, just calculate based on common patterns
    const now = new Date();

    // Parse simple cron patterns
    if (cronExpression === '*/15 * * * *') {
      // Every 15 minutes
      const minutes = Math.ceil(now.getMinutes() / 15) * 15;
      const next = new Date(now);
      next.setMinutes(minutes, 0, 0);
      if (next <= now) next.setMinutes(next.getMinutes() + 15);
      return next.toISOString();
    }

    if (cronExpression === '*/5 * * * *') {
      // Every 5 minutes
      const minutes = Math.ceil(now.getMinutes() / 5) * 5;
      const next = new Date(now);
      next.setMinutes(minutes, 0, 0);
      if (next <= now) next.setMinutes(next.getMinutes() + 5);
      return next.toISOString();
    }

    if (cronExpression === '0 9 * * *') {
      // Every day at 9 AM
      const next = new Date(now);
      next.setHours(9, 0, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      return next.toISOString();
    }

    // Default: 1 hour from now
    const next = new Date(now.getTime() + 60 * 60 * 1000);
    return next.toISOString();
  }

  static getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  static getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  static getTaskExecutions(taskId: string): TaskExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.taskId === taskId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  static async enableTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    task.enabled = true;
    this.setupTaskTimer(task);
    logger.info(`Task ${task.name} enabled`);
  }

  static async disableTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    task.enabled = false;

    const timer = this.timers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(taskId);
    }

    logger.info(`Task ${task.name} disabled`);
  }

  static async deleteTask(taskId: string): Promise<void> {
    await this.disableTask(taskId);
    this.tasks.delete(taskId);
    logger.info(`Task ${taskId} deleted`);
  }

  static async shutdown(): Promise<void> {
    logger.info('Shutting down TaskScheduler...');

    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    this.isRunning = false;
    logger.info('TaskScheduler shut down');
  }
}
