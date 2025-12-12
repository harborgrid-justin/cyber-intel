
import { Request, Response } from 'express';
import { CaseService } from '../services/case.service';
import { WorkflowEngine } from '../services/workflow/workflow.engine';
import { PlaybookRunner } from '../services/orchestration/playbook.runner';
import { EscalationService } from '../services/orchestration/escalation.service';
import { TaskScheduler } from '../services/orchestration/task.scheduler';
import { logger } from '../utils/logger';

export const listCases = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      assignee: req.query.assignee as string,
      priority: req.query.priority as string,
      slaBreached: req.query.slaBreached ? req.query.slaBreached === 'true' : undefined
    };
    const cases = await CaseService.getAll(filters);
    res.json({ data: cases });
  } catch (err) {
    logger.error('List cases error', err);
    res.status(500).json({ error: 'Internal Error' });
  }
};

export const createCase = async (req: Request, res: Response) => {
  try {
    // req.user is guaranteed by auth middleware
    const newCase = await CaseService.create(req.body, req.user!.username);
    res.status(201).json({ data: newCase });
  } catch (err) {
    logger.error('Create case error', err);
    res.status(500).json({ error: 'Failed to create case' });
  }
};

export const updateCase = async (req: Request, res: Response) => {
  try {
    const updated = await CaseService.update(req.params.id, req.body, req.user!.username);
    if (!updated) return res.status(404).json({ error: 'Case not found' });
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// Case Templates
export const getCaseTemplates = async (req: Request, res: Response) => {
  try {
    const templates = CaseService.getTemplates();
    res.json({ data: templates });
  } catch (err) {
    logger.error('Get templates error', err);
    res.status(500).json({ error: 'Failed to get templates' });
  }
};

export const getCaseTemplate = async (req: Request, res: Response) => {
  try {
    const template = CaseService.getTemplate(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json({ data: template });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get template' });
  }
};

// Case Linking
export const linkCases = async (req: Request, res: Response) => {
  try {
    const { targetId, linkType } = req.body;
    await CaseService.linkCases(req.params.id, targetId, linkType, req.user!.username);
    res.json({ success: true, message: 'Cases linked successfully' });
  } catch (err: any) {
    logger.error('Link cases error', err);
    res.status(400).json({ error: err.message || 'Failed to link cases' });
  }
};

export const unlinkCases = async (req: Request, res: Response) => {
  try {
    const { targetId } = req.body;
    await CaseService.unlinkCases(req.params.id, targetId, req.user!.username);
    res.json({ success: true, message: 'Cases unlinked successfully' });
  } catch (err) {
    logger.error('Unlink cases error', err);
    res.status(500).json({ error: 'Failed to unlink cases' });
  }
};

// Case Merging
export const mergeCases = async (req: Request, res: Response) => {
  try {
    const { secondaryIds } = req.body;
    const mergedCase = await CaseService.mergeCases(req.params.id, secondaryIds, req.user!.username);
    if (!mergedCase) return res.status(404).json({ error: 'Primary case not found' });
    res.json({ data: mergedCase, message: 'Cases merged successfully' });
  } catch (err) {
    logger.error('Merge cases error', err);
    res.status(500).json({ error: 'Failed to merge cases' });
  }
};

// SLA Management
export const checkCaseSLA = async (req: Request, res: Response) => {
  try {
    await CaseService.checkSLA(req.params.id);
    res.json({ success: true, message: 'SLA check completed' });
  } catch (err) {
    logger.error('SLA check error', err);
    res.status(500).json({ error: 'Failed to check SLA' });
  }
};

export const getSLAConfig = async (req: Request, res: Response) => {
  try {
    const { priority } = req.params;
    const config = CaseService.getSLAConfig(priority);
    if (!config) return res.status(404).json({ error: 'SLA config not found for priority' });
    res.json({ data: config });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get SLA config' });
  }
};

// Workflow Management
export const startCaseWorkflow = async (req: Request, res: Response) => {
  try {
    const { workflowId, initialVariables } = req.body;
    const instanceId = await WorkflowEngine.startWorkflow(
      workflowId,
      req.params.id,
      'CASE',
      req.user!.username,
      initialVariables
    );
    res.status(201).json({ data: { instanceId }, message: 'Workflow started successfully' });
  } catch (err: any) {
    logger.error('Start workflow error', err);
    res.status(400).json({ error: err.message || 'Failed to start workflow' });
  }
};

export const transitionCaseWorkflow = async (req: Request, res: Response) => {
  try {
    const { instanceId, transitionId, context } = req.body;
    await WorkflowEngine.transitionWorkflow(instanceId, transitionId, req.user!.username, context);
    res.json({ success: true, message: 'Workflow transitioned successfully' });
  } catch (err: any) {
    logger.error('Transition workflow error', err);
    res.status(400).json({ error: err.message || 'Failed to transition workflow' });
  }
};

export const getCaseWorkflows = async (req: Request, res: Response) => {
  try {
    const workflows = WorkflowEngine.getEntityWorkflows(req.params.id);
    res.json({ data: workflows });
  } catch (err) {
    logger.error('Get workflows error', err);
    res.status(500).json({ error: 'Failed to get workflows' });
  }
};

export const getWorkflowState = async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.params;
    const instance = WorkflowEngine.getInstance(instanceId);
    if (!instance) return res.status(404).json({ error: 'Workflow instance not found' });

    const currentState = WorkflowEngine.getCurrentState(instanceId);
    const availableTransitions = WorkflowEngine.getAvailableTransitions(instanceId);

    res.json({ data: { instance, currentState, availableTransitions } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get workflow state' });
  }
};

// Playbook Execution
export const executePlaybook = async (req: Request, res: Response) => {
  try {
    const { playbookId, parameters } = req.body;
    const executionId = await PlaybookRunner.executePlaybook(
      playbookId,
      req.user!.username,
      req.params.id,
      parameters
    );
    res.status(201).json({ data: { executionId }, message: 'Playbook execution started' });
  } catch (err: any) {
    logger.error('Execute playbook error', err);
    res.status(400).json({ error: err.message || 'Failed to execute playbook' });
  }
};

export const getPlaybookExecution = async (req: Request, res: Response) => {
  try {
    const execution = PlaybookRunner.getExecution(req.params.executionId);
    if (!execution) return res.status(404).json({ error: 'Execution not found' });
    res.json({ data: execution });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get execution' });
  }
};

export const listPlaybooks = async (req: Request, res: Response) => {
  try {
    const playbooks = PlaybookRunner.getAllPlaybooks();
    res.json({ data: playbooks });
  } catch (err) {
    logger.error('List playbooks error', err);
    res.status(500).json({ error: 'Failed to list playbooks' });
  }
};

// Escalation
export const escalateCase = async (req: Request, res: Response) => {
  try {
    const { policyId, level, reason } = req.body;
    const eventId = await EscalationService.manualEscalation(
      req.params.id,
      policyId,
      level,
      req.user!.username,
      reason
    );
    res.json({ data: { eventId }, message: 'Case escalated successfully' });
  } catch (err: any) {
    logger.error('Escalate case error', err);
    res.status(400).json({ error: err.message || 'Failed to escalate case' });
  }
};

export const getCaseEscalations = async (req: Request, res: Response) => {
  try {
    const escalations = EscalationService.getCaseEscalations(req.params.id);
    res.json({ data: escalations });
  } catch (err) {
    logger.error('Get escalations error', err);
    res.status(500).json({ error: 'Failed to get escalations' });
  }
};

export const getEscalationPolicies = async (req: Request, res: Response) => {
  try {
    const policies = EscalationService.getAllPolicies();
    res.json({ data: policies });
  } catch (err) {
    logger.error('Get escalation policies error', err);
    res.status(500).json({ error: 'Failed to get policies' });
  }
};

// Task Scheduling
export const scheduleCaseTask = async (req: Request, res: Response) => {
  try {
    const taskData = {
      ...req.body,
      metadata: {
        ...req.body.metadata,
        caseId: req.params.id,
        createdBy: req.user!.username,
        createdAt: new Date().toISOString()
      }
    };

    const taskId = TaskScheduler.scheduleTask(taskData);
    res.status(201).json({ data: { taskId }, message: 'Task scheduled successfully' });
  } catch (err) {
    logger.error('Schedule task error', err);
    res.status(500).json({ error: 'Failed to schedule task' });
  }
};

export const getCaseTasks = async (req: Request, res: Response) => {
  try {
    const allTasks = TaskScheduler.getAllTasks();
    const caseTasks = allTasks.filter(t => t.metadata.caseId === req.params.id);
    res.json({ data: caseTasks });
  } catch (err) {
    logger.error('Get case tasks error', err);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
};
