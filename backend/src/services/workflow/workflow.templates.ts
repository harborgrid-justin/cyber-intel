
import { WorkflowDefinition, WorkflowEngine } from './workflow.engine';

export class WorkflowTemplates {
  static initializeTemplates(): void {
    // Case Investigation Workflow
    WorkflowEngine.registerWorkflow(this.createCaseInvestigationWorkflow());

    // Incident Response Workflow
    WorkflowEngine.registerWorkflow(this.createIncidentResponseWorkflow());

    // Malware Analysis Workflow
    WorkflowEngine.registerWorkflow(this.createMalwareAnalysisWorkflow());

    // Threat Intelligence Workflow
    WorkflowEngine.registerWorkflow(this.createThreatIntelligenceWorkflow());

    // Security Audit Workflow
    WorkflowEngine.registerWorkflow(this.createSecurityAuditWorkflow());
  }

  private static createCaseInvestigationWorkflow(): WorkflowDefinition {
    return {
      id: 'WF-CASE-INVESTIGATION',
      name: 'Case Investigation Workflow',
      version: '1.0',
      description: 'Standard workflow for security case investigation',
      entityType: 'CASE',
      initialStateId: 'NEW',
      variables: [
        { name: 'priority', type: 'string', defaultValue: 'MEDIUM', required: true },
        { name: 'assignee', type: 'string', required: false },
        { name: 'requiresForensics', type: 'boolean', defaultValue: false }
      ],
      states: [
        {
          id: 'NEW',
          name: 'New',
          type: 'START',
          description: 'Case has been created and awaits initial triage',
          transitions: [
            {
              id: 'TR-ASSIGN',
              name: 'Assign for Triage',
              targetStateId: 'TRIAGE',
              automated: true
            }
          ],
          actions: [
            {
              type: 'NOTIFICATION',
              target: 'case-created',
              parameters: { notify: 'team-lead' },
              runOn: 'ENTRY'
            }
          ]
        },
        {
          id: 'TRIAGE',
          name: 'Triage',
          type: 'INTERMEDIATE',
          description: 'Initial assessment and prioritization',
          transitions: [
            {
              id: 'TR-ESCALATE',
              name: 'Escalate to Investigation',
              targetStateId: 'INVESTIGATING',
              condition: 'priority === "HIGH" || priority === "CRITICAL"'
            },
            {
              id: 'TR-CLOSE-FALSE-POSITIVE',
              name: 'Close as False Positive',
              targetStateId: 'CLOSED',
              requiresApproval: true,
              approvalRoles: ['analyst', 'team-lead']
            },
            {
              id: 'TR-BACKLOG',
              name: 'Move to Backlog',
              targetStateId: 'BACKLOG',
              condition: 'priority === "LOW"'
            }
          ],
          actions: [
            {
              type: 'ASSIGNMENT',
              target: 'auto-assign',
              parameters: { role: 'analyst' },
              runOn: 'ENTRY'
            }
          ],
          validations: [
            {
              field: 'priority',
              rule: 'required',
              errorMessage: 'Priority must be set during triage'
            }
          ]
        },
        {
          id: 'BACKLOG',
          name: 'Backlog',
          type: 'INTERMEDIATE',
          description: 'Low priority cases waiting for resources',
          transitions: [
            {
              id: 'TR-RESUME',
              name: 'Resume Investigation',
              targetStateId: 'INVESTIGATING'
            },
            {
              id: 'TR-CLOSE-WONTFIX',
              name: 'Close - Won\'t Fix',
              targetStateId: 'CLOSED',
              requiresApproval: true,
              approvalRoles: ['team-lead']
            }
          ]
        },
        {
          id: 'INVESTIGATING',
          name: 'Investigating',
          type: 'INTERMEDIATE',
          description: 'Active investigation in progress',
          transitions: [
            {
              id: 'TR-CONTAINMENT',
              name: 'Move to Containment',
              targetStateId: 'CONTAINMENT',
              condition: 'requiresForensics === false'
            },
            {
              id: 'TR-FORENSICS',
              name: 'Forensic Analysis Required',
              targetStateId: 'FORENSIC_ANALYSIS',
              condition: 'requiresForensics === true'
            },
            {
              id: 'TR-MORE-INFO',
              name: 'Need More Information',
              targetStateId: 'PENDING_INFO'
            },
            {
              id: 'TR-ESCALATE-CRITICAL',
              name: 'Escalate to Incident',
              targetStateId: 'INCIDENT_ESCALATION',
              condition: 'priority === "CRITICAL"',
              requiresApproval: true,
              approvalRoles: ['team-lead', 'manager']
            }
          ],
          actions: [
            {
              type: 'STATUS_UPDATE',
              target: 'update-status',
              parameters: { status: 'IN_PROGRESS' },
              runOn: 'ENTRY'
            }
          ]
        },
        {
          id: 'FORENSIC_ANALYSIS',
          name: 'Forensic Analysis',
          type: 'INTERMEDIATE',
          description: 'Detailed forensic investigation',
          transitions: [
            {
              id: 'TR-ANALYSIS-COMPLETE',
              name: 'Analysis Complete',
              targetStateId: 'CONTAINMENT'
            }
          ],
          actions: [
            {
              type: 'ASSIGNMENT',
              target: 'assign-forensics',
              parameters: { role: 'forensic-analyst' },
              runOn: 'ENTRY'
            },
            {
              type: 'NOTIFICATION',
              target: 'forensic-assigned',
              parameters: { notify: 'forensics-team' },
              runOn: 'ENTRY'
            }
          ]
        },
        {
          id: 'PENDING_INFO',
          name: 'Pending Information',
          type: 'INTERMEDIATE',
          description: 'Waiting for additional information',
          transitions: [
            {
              id: 'TR-INFO-RECEIVED',
              name: 'Information Received',
              targetStateId: 'INVESTIGATING'
            },
            {
              id: 'TR-TIMEOUT-CLOSE',
              name: 'Close - No Response',
              targetStateId: 'CLOSED',
              requiresApproval: true
            }
          ]
        },
        {
          id: 'INCIDENT_ESCALATION',
          name: 'Incident Escalation',
          type: 'DECISION',
          description: 'Escalated to major incident',
          transitions: [
            {
              id: 'TR-INCIDENT-CONFIRMED',
              name: 'Confirmed as Major Incident',
              targetStateId: 'CONTAINMENT'
            }
          ],
          actions: [
            {
              type: 'NOTIFICATION',
              target: 'critical-alert',
              parameters: { notify: 'incident-commander', channels: ['pagerduty', 'sms'] },
              runOn: 'ENTRY'
            },
            {
              type: 'CUSTOM',
              target: 'create-war-room',
              parameters: { type: 'emergency' },
              runOn: 'ENTRY'
            }
          ]
        },
        {
          id: 'CONTAINMENT',
          name: 'Containment',
          type: 'INTERMEDIATE',
          description: 'Threat contained, preparing for remediation',
          transitions: [
            {
              id: 'TR-REMEDIATE',
              name: 'Begin Remediation',
              targetStateId: 'REMEDIATION'
            }
          ],
          actions: [
            {
              type: 'NOTIFICATION',
              target: 'containment-complete',
              parameters: { notify: 'stakeholders' },
              runOn: 'ENTRY'
            }
          ]
        },
        {
          id: 'REMEDIATION',
          name: 'Remediation',
          type: 'INTERMEDIATE',
          description: 'Remediating the security issue',
          transitions: [
            {
              id: 'TR-VERIFY',
              name: 'Remediation Complete - Verify',
              targetStateId: 'VERIFICATION'
            }
          ]
        },
        {
          id: 'VERIFICATION',
          name: 'Verification',
          type: 'INTERMEDIATE',
          description: 'Verifying remediation effectiveness',
          transitions: [
            {
              id: 'TR-VERIFIED',
              name: 'Verified - Close Case',
              targetStateId: 'CLOSED'
            },
            {
              id: 'TR-REOPEN',
              name: 'Verification Failed - Reopen',
              targetStateId: 'INVESTIGATING'
            }
          ]
        },
        {
          id: 'CLOSED',
          name: 'Closed',
          type: 'END',
          description: 'Case investigation complete',
          transitions: [],
          actions: [
            {
              type: 'STATUS_UPDATE',
              target: 'update-status',
              parameters: { status: 'CLOSED' },
              runOn: 'ENTRY'
            },
            {
              type: 'NOTIFICATION',
              target: 'case-closed',
              parameters: { notify: 'reporter,assignee' },
              runOn: 'ENTRY'
            },
            {
              type: 'CUSTOM',
              target: 'generate-final-report',
              parameters: {},
              runOn: 'ENTRY'
            }
          ]
        }
      ],
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        lastModified: '2025-01-01',
        tags: ['case', 'investigation', 'security']
      }
    };
  }

  private static createIncidentResponseWorkflow(): WorkflowDefinition {
    return {
      id: 'WF-INCIDENT-RESPONSE',
      name: 'Incident Response Workflow',
      version: '1.0',
      description: 'NIST-based incident response workflow',
      entityType: 'INCIDENT',
      initialStateId: 'DETECTION',
      variables: [
        { name: 'severity', type: 'string', defaultValue: 'MEDIUM', required: true },
        { name: 'incidentType', type: 'string', required: true },
        { name: 'affectedSystems', type: 'array', defaultValue: [] }
      ],
      states: [
        {
          id: 'DETECTION',
          name: 'Detection & Analysis',
          type: 'START',
          description: 'Initial detection and analysis phase',
          transitions: [
            {
              id: 'TR-CONFIRM',
              name: 'Confirm Incident',
              targetStateId: 'CONTAINMENT'
            },
            {
              id: 'TR-FALSE-ALARM',
              name: 'False Alarm',
              targetStateId: 'CLOSED'
            }
          ]
        },
        {
          id: 'CONTAINMENT',
          name: 'Containment',
          type: 'INTERMEDIATE',
          description: 'Short-term and long-term containment',
          transitions: [
            {
              id: 'TR-ERADICATE',
              name: 'Move to Eradication',
              targetStateId: 'ERADICATION'
            }
          ],
          actions: [
            {
              type: 'NOTIFICATION',
              target: 'incident-containment',
              parameters: { priority: 'HIGH' },
              runOn: 'ENTRY'
            }
          ]
        },
        {
          id: 'ERADICATION',
          name: 'Eradication',
          type: 'INTERMEDIATE',
          description: 'Remove threat from environment',
          transitions: [
            {
              id: 'TR-RECOVER',
              name: 'Begin Recovery',
              targetStateId: 'RECOVERY'
            }
          ]
        },
        {
          id: 'RECOVERY',
          name: 'Recovery',
          type: 'INTERMEDIATE',
          description: 'Restore systems to normal operations',
          transitions: [
            {
              id: 'TR-POST-INCIDENT',
              name: 'Post-Incident Review',
              targetStateId: 'POST_INCIDENT'
            }
          ]
        },
        {
          id: 'POST_INCIDENT',
          name: 'Post-Incident Activity',
          type: 'INTERMEDIATE',
          description: 'Lessons learned and documentation',
          transitions: [
            {
              id: 'TR-COMPLETE',
              name: 'Complete Incident',
              targetStateId: 'CLOSED'
            }
          ],
          actions: [
            {
              type: 'CUSTOM',
              target: 'generate-lessons-learned',
              parameters: {},
              runOn: 'EXIT'
            }
          ]
        },
        {
          id: 'CLOSED',
          name: 'Closed',
          type: 'END',
          description: 'Incident response complete',
          transitions: []
        }
      ],
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        lastModified: '2025-01-01',
        tags: ['incident', 'response', 'nist']
      }
    };
  }

  private static createMalwareAnalysisWorkflow(): WorkflowDefinition {
    return {
      id: 'WF-MALWARE-ANALYSIS',
      name: 'Malware Analysis Workflow',
      version: '1.0',
      description: 'Malware sample analysis workflow',
      entityType: 'CASE',
      initialStateId: 'SUBMISSION',
      variables: [
        { name: 'sampleHash', type: 'string', required: true },
        { name: 'analysisType', type: 'string', defaultValue: 'FULL' },
        { name: 'isSafe', type: 'boolean', defaultValue: false }
      ],
      states: [
        {
          id: 'SUBMISSION',
          name: 'Sample Submission',
          type: 'START',
          transitions: [{ id: 'TR-STATIC', name: 'Begin Static Analysis', targetStateId: 'STATIC_ANALYSIS' }]
        },
        {
          id: 'STATIC_ANALYSIS',
          name: 'Static Analysis',
          type: 'PARALLEL',
          description: 'Static code analysis without execution',
          transitions: [
            { id: 'TR-DYNAMIC', name: 'Move to Dynamic Analysis', targetStateId: 'DYNAMIC_ANALYSIS' },
            { id: 'TR-SAFE', name: 'Mark as Safe', targetStateId: 'REPORTING', condition: 'isSafe === true' }
          ]
        },
        {
          id: 'DYNAMIC_ANALYSIS',
          name: 'Dynamic Analysis',
          type: 'INTERMEDIATE',
          description: 'Sandbox execution and behavior analysis',
          transitions: [{ id: 'TR-REPORT', name: 'Generate Report', targetStateId: 'REPORTING' }]
        },
        {
          id: 'REPORTING',
          name: 'Report Generation',
          type: 'INTERMEDIATE',
          transitions: [{ id: 'TR-COMPLETE', name: 'Analysis Complete', targetStateId: 'CLOSED' }],
          actions: [
            {
              type: 'CUSTOM',
              target: 'generate-analysis-report',
              parameters: {},
              runOn: 'ENTRY'
            }
          ]
        },
        {
          id: 'CLOSED',
          name: 'Closed',
          type: 'END',
          transitions: []
        }
      ],
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        lastModified: '2025-01-01',
        tags: ['malware', 'analysis', 'sandbox']
      }
    };
  }

  private static createThreatIntelligenceWorkflow(): WorkflowDefinition {
    return {
      id: 'WF-THREAT-INTEL',
      name: 'Threat Intelligence Processing',
      version: '1.0',
      description: 'Threat intelligence collection and dissemination workflow',
      entityType: 'THREAT',
      initialStateId: 'COLLECTION',
      variables: [
        { name: 'source', type: 'string', required: true },
        { name: 'confidence', type: 'number', defaultValue: 50 },
        { name: 'actionable', type: 'boolean', defaultValue: false }
      ],
      states: [
        {
          id: 'COLLECTION',
          name: 'Collection',
          type: 'START',
          transitions: [{ id: 'TR-PROCESS', name: 'Process Intelligence', targetStateId: 'PROCESSING' }]
        },
        {
          id: 'PROCESSING',
          name: 'Processing & Enrichment',
          type: 'INTERMEDIATE',
          transitions: [{ id: 'TR-ANALYZE', name: 'Analyze', targetStateId: 'ANALYSIS' }]
        },
        {
          id: 'ANALYSIS',
          name: 'Analysis',
          type: 'DECISION',
          transitions: [
            { id: 'TR-DISSEMINATE', name: 'Disseminate', targetStateId: 'DISSEMINATION', condition: 'actionable === true' },
            { id: 'TR-ARCHIVE', name: 'Archive', targetStateId: 'CLOSED', condition: 'actionable === false' }
          ]
        },
        {
          id: 'DISSEMINATION',
          name: 'Dissemination',
          type: 'INTERMEDIATE',
          transitions: [{ id: 'TR-COMPLETE', name: 'Complete', targetStateId: 'CLOSED' }],
          actions: [
            {
              type: 'NOTIFICATION',
              target: 'threat-detected',
              parameters: { channels: ['email', 'slack'] },
              runOn: 'ENTRY'
            }
          ]
        },
        {
          id: 'CLOSED',
          name: 'Closed',
          type: 'END',
          transitions: []
        }
      ],
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        lastModified: '2025-01-01',
        tags: ['threat-intelligence', 'intel', 'collection']
      }
    };
  }

  private static createSecurityAuditWorkflow(): WorkflowDefinition {
    return {
      id: 'WF-SECURITY-AUDIT',
      name: 'Security Audit Workflow',
      version: '1.0',
      description: 'Security compliance audit workflow',
      entityType: 'CASE',
      initialStateId: 'PLANNING',
      variables: [
        { name: 'auditType', type: 'string', required: true },
        { name: 'framework', type: 'string', defaultValue: 'NIST' },
        { name: 'complianceScore', type: 'number', defaultValue: 0 }
      ],
      states: [
        {
          id: 'PLANNING',
          name: 'Audit Planning',
          type: 'START',
          transitions: [{ id: 'TR-EXECUTE', name: 'Begin Audit', targetStateId: 'EXECUTION' }]
        },
        {
          id: 'EXECUTION',
          name: 'Audit Execution',
          type: 'INTERMEDIATE',
          transitions: [{ id: 'TR-FINDINGS', name: 'Document Findings', targetStateId: 'FINDINGS' }]
        },
        {
          id: 'FINDINGS',
          name: 'Findings Review',
          type: 'INTERMEDIATE',
          transitions: [{ id: 'TR-REMEDIATION', name: 'Remediation Plan', targetStateId: 'REMEDIATION_PLAN' }]
        },
        {
          id: 'REMEDIATION_PLAN',
          name: 'Remediation Planning',
          type: 'INTERMEDIATE',
          transitions: [{ id: 'TR-REPORT', name: 'Final Report', targetStateId: 'REPORTING' }]
        },
        {
          id: 'REPORTING',
          name: 'Report Generation',
          type: 'INTERMEDIATE',
          transitions: [{ id: 'TR-COMPLETE', name: 'Audit Complete', targetStateId: 'CLOSED' }]
        },
        {
          id: 'CLOSED',
          name: 'Closed',
          type: 'END',
          transitions: []
        }
      ],
      metadata: {
        createdBy: 'SYSTEM',
        createdAt: '2025-01-01',
        lastModified: '2025-01-01',
        tags: ['audit', 'compliance', 'security']
      }
    };
  }
}
