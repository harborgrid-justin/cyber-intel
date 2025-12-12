
import { AuditService } from '../audit.service';
import { logger } from '../../utils/logger';

export interface PlaybookAction {
  id: string;
  name: string;
  type: 'ISOLATE' | 'BLOCK' | 'NOTIFY' | 'COLLECT' | 'ANALYZE' | 'REMEDIATE' | 'CUSTOM';
  description: string;
  parameters: Record<string, any>;
  timeout: number;
  retryOnFailure: boolean;
  maxRetries: number;
  dependsOn?: string[];
  isParallel?: boolean;
}

export interface PlaybookDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  trigger: 'MANUAL' | 'AUTOMATIC' | 'SCHEDULED';
  triggerConditions?: Record<string, any>;
  actions: PlaybookAction[];
  rollbackActions?: PlaybookAction[];
  metadata: {
    author: string;
    created: string;
    lastModified: string;
    tags: string[];
  };
}

export interface PlaybookExecution {
  id: string;
  playbookId: string;
  caseId?: string;
  status: 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  startedAt: string;
  completedAt?: string;
  startedBy: string;
  currentAction?: string;
  actionResults: Map<string, ActionResult>;
  errors: string[];
  rollbackReason?: string;
}

export interface ActionResult {
  actionId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  startedAt?: string;
  completedAt?: string;
  output?: any;
  error?: string;
  retryCount: number;
}

export class PlaybookRunner {
  private static executions: Map<string, PlaybookExecution> = new Map();
  private static playbooks: Map<string, PlaybookDefinition> = new Map();

  // Initialize with default playbooks
  static {
    this.registerDefaultPlaybooks();
  }

  private static registerDefaultPlaybooks(): void {
    // Malware Response Playbook
    this.playbooks.set('PB-MALWARE-001', {
      id: 'PB-MALWARE-001',
      name: 'Malware Incident Response',
      description: 'Automated response for malware detection',
      version: '1.0',
      trigger: 'AUTOMATIC',
      triggerConditions: { threatType: 'malware', severity: ['HIGH', 'CRITICAL'] },
      actions: [
        {
          id: 'ACT-001',
          name: 'Isolate Endpoint',
          type: 'ISOLATE',
          description: 'Isolate infected endpoint from network',
          parameters: { scope: 'network', method: 'EDR' },
          timeout: 60000,
          retryOnFailure: true,
          maxRetries: 3
        },
        {
          id: 'ACT-002',
          name: 'Collect Artifacts',
          type: 'COLLECT',
          description: 'Collect malware samples and logs',
          parameters: { artifacts: ['memory_dump', 'disk_image', 'logs'] },
          timeout: 300000,
          retryOnFailure: false,
          maxRetries: 0,
          dependsOn: ['ACT-001']
        },
        {
          id: 'ACT-003',
          name: 'Block IOCs',
          type: 'BLOCK',
          description: 'Block identified IOCs in security controls',
          parameters: { controls: ['firewall', 'edr', 'proxy'] },
          timeout: 30000,
          retryOnFailure: true,
          maxRetries: 2,
          isParallel: true
        },
        {
          id: 'ACT-004',
          name: 'Notify Security Team',
          type: 'NOTIFY',
          description: 'Alert security team of incident',
          parameters: { channels: ['email', 'slack', 'pagerduty'], severity: 'HIGH' },
          timeout: 10000,
          retryOnFailure: true,
          maxRetries: 2,
          isParallel: true
        },
        {
          id: 'ACT-005',
          name: 'Run AV Scan',
          type: 'ANALYZE',
          description: 'Run comprehensive antivirus scan',
          parameters: { scanType: 'full', quarantine: true },
          timeout: 600000,
          retryOnFailure: false,
          maxRetries: 0,
          dependsOn: ['ACT-002']
        }
      ],
      rollbackActions: [
        {
          id: 'RB-001',
          name: 'Restore Network Access',
          type: 'REMEDIATE',
          description: 'Restore endpoint network access if false positive',
          parameters: { scope: 'network' },
          timeout: 30000,
          retryOnFailure: true,
          maxRetries: 3
        }
      ],
      metadata: {
        author: 'SENTINEL',
        created: '2025-01-01',
        lastModified: '2025-01-01',
        tags: ['malware', 'automated', 'incident-response']
      }
    });

    // Phishing Response Playbook
    this.playbooks.set('PB-PHISHING-001', {
      id: 'PB-PHISHING-001',
      name: 'Phishing Email Response',
      description: 'Automated phishing email investigation and remediation',
      version: '1.0',
      trigger: 'MANUAL',
      actions: [
        {
          id: 'ACT-001',
          name: 'Extract Email Metadata',
          type: 'ANALYZE',
          description: 'Extract headers, URLs, and attachments',
          parameters: { extractHeaders: true, extractUrls: true, extractAttachments: true },
          timeout: 30000,
          retryOnFailure: false,
          maxRetries: 0
        },
        {
          id: 'ACT-002',
          name: 'Block Malicious URLs',
          type: 'BLOCK',
          description: 'Add URLs to block list',
          parameters: { controls: ['proxy', 'email_gateway'] },
          timeout: 20000,
          retryOnFailure: true,
          maxRetries: 2,
          dependsOn: ['ACT-001']
        },
        {
          id: 'ACT-003',
          name: 'Quarantine Email',
          type: 'REMEDIATE',
          description: 'Quarantine email from all mailboxes',
          parameters: { searchScope: 'organization' },
          timeout: 60000,
          retryOnFailure: true,
          maxRetries: 2,
          dependsOn: ['ACT-001']
        },
        {
          id: 'ACT-004',
          name: 'Check Credential Compromise',
          type: 'ANALYZE',
          description: 'Check if users submitted credentials',
          parameters: { checkLogs: true, timeWindow: '24h' },
          timeout: 120000,
          retryOnFailure: false,
          maxRetries: 0,
          dependsOn: ['ACT-001']
        },
        {
          id: 'ACT-005',
          name: 'Reset Compromised Accounts',
          type: 'REMEDIATE',
          description: 'Force password reset for affected users',
          parameters: { forceReset: true, revokeTokens: true },
          timeout: 30000,
          retryOnFailure: true,
          maxRetries: 2,
          dependsOn: ['ACT-004']
        }
      ],
      metadata: {
        author: 'SENTINEL',
        created: '2025-01-01',
        lastModified: '2025-01-01',
        tags: ['phishing', 'email', 'incident-response']
      }
    });

    // Data Exfiltration Response
    this.playbooks.set('PB-EXFIL-001', {
      id: 'PB-EXFIL-001',
      name: 'Data Exfiltration Response',
      description: 'Response to detected data exfiltration',
      version: '1.0',
      trigger: 'AUTOMATIC',
      triggerConditions: { alertType: 'data_exfiltration', severity: 'CRITICAL' },
      actions: [
        {
          id: 'ACT-001',
          name: 'Block Outbound Connection',
          type: 'BLOCK',
          description: 'Block suspicious outbound connections',
          parameters: { controls: ['firewall', 'proxy'], action: 'deny' },
          timeout: 15000,
          retryOnFailure: true,
          maxRetries: 3
        },
        {
          id: 'ACT-002',
          name: 'Isolate Source System',
          type: 'ISOLATE',
          description: 'Isolate system suspected of exfiltration',
          parameters: { scope: 'network', preserveForensics: true },
          timeout: 30000,
          retryOnFailure: true,
          maxRetries: 2,
          isParallel: true
        },
        {
          id: 'ACT-003',
          name: 'Notify Incident Commander',
          type: 'NOTIFY',
          description: 'Escalate to incident commander immediately',
          parameters: { channels: ['pagerduty', 'phone'], priority: 'CRITICAL' },
          timeout: 10000,
          retryOnFailure: true,
          maxRetries: 3,
          isParallel: true
        },
        {
          id: 'ACT-004',
          name: 'Capture Network Traffic',
          type: 'COLLECT',
          description: 'Capture PCAP of suspicious traffic',
          parameters: { duration: 300, interface: 'mirror' },
          timeout: 310000,
          retryOnFailure: false,
          maxRetries: 0,
          dependsOn: ['ACT-001']
        },
        {
          id: 'ACT-005',
          name: 'Analyze Exfiltrated Data',
          type: 'ANALYZE',
          description: 'Determine sensitivity of exfiltrated data',
          parameters: { classifyData: true, estimateVolume: true },
          timeout: 120000,
          retryOnFailure: false,
          maxRetries: 0,
          dependsOn: ['ACT-004']
        }
      ],
      metadata: {
        author: 'SENTINEL',
        created: '2025-01-01',
        lastModified: '2025-01-01',
        tags: ['data-exfiltration', 'critical', 'automated']
      }
    });
  }

  static async executePlaybook(
    playbookId: string,
    userId: string,
    caseId?: string,
    overrideParams?: Record<string, any>
  ): Promise<string> {
    const playbook = this.playbooks.get(playbookId);
    if (!playbook) {
      throw new Error(`Playbook ${playbookId} not found`);
    }

    const executionId = `EXEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const execution: PlaybookExecution = {
      id: executionId,
      playbookId,
      caseId,
      status: 'PENDING',
      startedAt: new Date().toISOString(),
      startedBy: userId,
      actionResults: new Map(),
      errors: []
    };

    this.executions.set(executionId, execution);

    // Initialize action results
    playbook.actions.forEach(action => {
      execution.actionResults.set(action.id, {
        actionId: action.id,
        status: 'PENDING',
        retryCount: 0
      });
    });

    await AuditService.log(userId, 'PLAYBOOK_STARTED', `Started playbook ${playbook.name} (${executionId})`, caseId || executionId);

    // Execute playbook asynchronously
    this.runPlaybook(execution, playbook, overrideParams).catch(err => {
      logger.error('Playbook execution error:', err);
      execution.status = 'FAILED';
      execution.errors.push(err.message);
      execution.completedAt = new Date().toISOString();
    });

    return executionId;
  }

  private static async runPlaybook(
    execution: PlaybookExecution,
    playbook: PlaybookDefinition,
    overrideParams?: Record<string, any>
  ): Promise<void> {
    execution.status = 'RUNNING';

    try {
      // Build dependency graph
      const actionMap = new Map(playbook.actions.map(a => [a.id, a]));
      const completedActions = new Set<string>();

      while (completedActions.size < playbook.actions.length) {
        // Find actions ready to execute
        const readyActions = playbook.actions.filter(action => {
          if (completedActions.has(action.id)) return false;

          const result = execution.actionResults.get(action.id);
          if (result?.status === 'RUNNING' || result?.status === 'SUCCESS' || result?.status === 'FAILED') {
            return false;
          }

          // Check dependencies
          if (action.dependsOn && action.dependsOn.length > 0) {
            return action.dependsOn.every(depId => {
              const depResult = execution.actionResults.get(depId);
              return depResult?.status === 'SUCCESS';
            });
          }

          return true;
        });

        if (readyActions.length === 0) {
          // Check if we're stuck
          const runningActions = Array.from(execution.actionResults.values()).filter(r => r.status === 'RUNNING');
          if (runningActions.length === 0) {
            // No actions running and none ready - likely dependency failure
            throw new Error('Playbook execution stalled due to failed dependencies');
          }
          // Wait for running actions
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        // Execute ready actions (parallel if marked)
        const parallelActions = readyActions.filter(a => a.isParallel);
        const sequentialActions = readyActions.filter(a => !a.isParallel);

        // Execute parallel actions
        if (parallelActions.length > 0) {
          await Promise.all(parallelActions.map(action =>
            this.executeAction(execution, action, overrideParams)
          ));
          parallelActions.forEach(a => completedActions.add(a.id));
        }

        // Execute first sequential action
        if (sequentialActions.length > 0) {
          const action = sequentialActions[0];
          await this.executeAction(execution, action, overrideParams);
          completedActions.add(action.id);
        }
      }

      // Check if all actions succeeded
      const failedActions = Array.from(execution.actionResults.values()).filter(r => r.status === 'FAILED');
      if (failedActions.length > 0) {
        execution.status = 'FAILED';
        execution.errors.push(`${failedActions.length} action(s) failed`);
      } else {
        execution.status = 'COMPLETED';
      }

    } catch (error: any) {
      execution.status = 'FAILED';
      execution.errors.push(error.message);
      logger.error('Playbook execution failed:', error);
    } finally {
      execution.completedAt = new Date().toISOString();
      await AuditService.log(
        execution.startedBy,
        'PLAYBOOK_COMPLETED',
        `Playbook ${execution.playbookId} completed with status: ${execution.status}`,
        execution.caseId || execution.id
      );
    }
  }

  private static async executeAction(
    execution: PlaybookExecution,
    action: PlaybookAction,
    overrideParams?: Record<string, any>
  ): Promise<void> {
    const result = execution.actionResults.get(action.id)!;
    result.status = 'RUNNING';
    result.startedAt = new Date().toISOString();
    execution.currentAction = action.id;

    try {
      logger.info(`Executing action ${action.name} (${action.id})`);

      // Merge override parameters
      const params = { ...action.parameters, ...overrideParams };

      // Simulate action execution based on type
      const output = await this.simulateActionExecution(action, params);

      result.status = 'SUCCESS';
      result.output = output;
      result.completedAt = new Date().toISOString();

      logger.info(`Action ${action.name} completed successfully`);

    } catch (error: any) {
      logger.error(`Action ${action.name} failed:`, error);
      result.error = error.message;

      // Retry logic
      if (action.retryOnFailure && result.retryCount < action.maxRetries) {
        result.retryCount++;
        logger.info(`Retrying action ${action.name} (attempt ${result.retryCount}/${action.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000 * result.retryCount)); // Exponential backoff
        return this.executeAction(execution, action, overrideParams);
      }

      result.status = 'FAILED';
      result.completedAt = new Date().toISOString();
      execution.errors.push(`Action ${action.name} failed: ${error.message}`);
    }
  }

  private static async simulateActionExecution(action: PlaybookAction, params: Record<string, any>): Promise<any> {
    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    // Simulate action-specific outputs
    switch (action.type) {
      case 'ISOLATE':
        return { isolated: true, timestamp: new Date().toISOString(), method: params.method || 'network' };
      case 'BLOCK':
        return { blocked: true, controls: params.controls || [], count: params.controls?.length || 0 };
      case 'NOTIFY':
        return { notified: true, channels: params.channels || [], recipients: ['security-team'] };
      case 'COLLECT':
        return { collected: true, artifacts: params.artifacts || [], size: '1.2GB' };
      case 'ANALYZE':
        return { analyzed: true, findings: ['Suspicious process detected', 'Network anomaly'], risk: 'HIGH' };
      case 'REMEDIATE':
        return { remediated: true, affectedSystems: 1, timestamp: new Date().toISOString() };
      default:
        return { executed: true };
    }
  }

  static async pauseExecution(executionId: string, userId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) throw new Error('Execution not found');

    execution.status = 'PAUSED';
    await AuditService.log(userId, 'PLAYBOOK_PAUSED', `Paused playbook execution ${executionId}`, execution.caseId || executionId);
  }

  static async resumeExecution(executionId: string, userId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) throw new Error('Execution not found');

    if (execution.status !== 'PAUSED') {
      throw new Error('Can only resume paused executions');
    }

    execution.status = 'RUNNING';
    await AuditService.log(userId, 'PLAYBOOK_RESUMED', `Resumed playbook execution ${executionId}`, execution.caseId || executionId);
  }

  static async rollbackExecution(executionId: string, userId: string, reason: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) throw new Error('Execution not found');

    const playbook = this.playbooks.get(execution.playbookId);
    if (!playbook?.rollbackActions) {
      throw new Error('Playbook has no rollback actions defined');
    }

    execution.rollbackReason = reason;
    execution.status = 'ROLLED_BACK';

    // Execute rollback actions
    for (const action of playbook.rollbackActions) {
      await this.executeAction(execution, action, {});
    }

    await AuditService.log(userId, 'PLAYBOOK_ROLLED_BACK', `Rolled back playbook ${executionId}: ${reason}`, execution.caseId || executionId);
  }

  static getExecution(executionId: string): PlaybookExecution | undefined {
    return this.executions.get(executionId);
  }

  static getPlaybook(playbookId: string): PlaybookDefinition | undefined {
    return this.playbooks.get(playbookId);
  }

  static getAllPlaybooks(): PlaybookDefinition[] {
    return Array.from(this.playbooks.values());
  }

  static registerPlaybook(playbook: PlaybookDefinition): void {
    this.playbooks.set(playbook.id, playbook);
    logger.info(`Registered playbook: ${playbook.name} (${playbook.id})`);
  }
}
