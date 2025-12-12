
import { AuditService } from '../audit.service';
import { logger } from '../../utils/logger';

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'EMAIL' | 'SLACK' | 'TEAMS' | 'PAGERDUTY' | 'WEBHOOK' | 'SMS';
  enabled: boolean;
  config: Record<string, any>;
  priority: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  variables: string[];
  channels: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Notification {
  id: string;
  templateId?: string;
  recipients: string[];
  subject: string;
  body: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  channels: string[];
  status: 'PENDING' | 'SENT' | 'FAILED' | 'RETRY';
  createdAt: string;
  sentAt?: string;
  error?: string;
  metadata: {
    caseId?: string;
    userId?: string;
    eventType?: string;
  };
}

export class NotificationService {
  private static channels: Map<string, NotificationChannel> = new Map();
  private static templates: Map<string, NotificationTemplate> = new Map();
  private static notifications: Map<string, Notification> = new Map();

  static {
    this.initializeChannels();
    this.initializeTemplates();
  }

  private static initializeChannels(): void {
    // Email Channel
    this.channels.set('email', {
      id: 'email',
      name: 'Email',
      type: 'EMAIL',
      enabled: true,
      config: {
        smtpServer: 'smtp.sentinel.local',
        port: 587,
        defaultFrom: 'alerts@sentinel.local'
      },
      priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    });

    // Slack Channel
    this.channels.set('slack', {
      id: 'slack',
      name: 'Slack',
      type: 'SLACK',
      enabled: true,
      config: {
        webhookUrl: 'https://hooks.slack.com/services/...',
        defaultChannel: '#security-alerts'
      },
      priority: ['MEDIUM', 'HIGH', 'CRITICAL']
    });

    // Microsoft Teams Channel
    this.channels.set('teams', {
      id: 'teams',
      name: 'Microsoft Teams',
      type: 'TEAMS',
      enabled: true,
      config: {
        webhookUrl: 'https://outlook.office.com/webhook/...'
      },
      priority: ['HIGH', 'CRITICAL']
    });

    // PagerDuty Channel
    this.channels.set('pagerduty', {
      id: 'pagerduty',
      name: 'PagerDuty',
      type: 'PAGERDUTY',
      enabled: true,
      config: {
        integrationKey: 'xxxx',
        routingKey: 'yyyy'
      },
      priority: ['CRITICAL']
    });

    // SMS Channel
    this.channels.set('sms', {
      id: 'sms',
      name: 'SMS',
      type: 'SMS',
      enabled: true,
      config: {
        provider: 'twilio',
        accountSid: 'xxxx',
        authToken: 'yyyy'
      },
      priority: ['CRITICAL']
    });

    // Generic Webhook Channel
    this.channels.set('webhook', {
      id: 'webhook',
      name: 'Custom Webhook',
      type: 'WEBHOOK',
      enabled: true,
      config: {
        url: 'https://api.example.com/webhook',
        method: 'POST'
      },
      priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    });
  }

  private static initializeTemplates(): void {
    // Case Created Template
    this.templates.set('case-created', {
      id: 'case-created',
      name: 'Case Created',
      description: 'Notification when a new case is created',
      subject: 'New Case Created: {{caseId}} - {{title}}',
      body: `A new case has been created:

Case ID: {{caseId}}
Title: {{title}}
Priority: {{priority}}
Assignee: {{assignee}}
Description: {{description}}

View case: {{caseUrl}}`,
      variables: ['caseId', 'title', 'priority', 'assignee', 'description', 'caseUrl'],
      channels: ['email', 'slack'],
      priority: 'MEDIUM'
    });

    // SLA Breach Template
    this.templates.set('sla-breach', {
      id: 'sla-breach',
      name: 'SLA Breach',
      description: 'Alert when a case breaches SLA',
      subject: 'SLA BREACH: Case {{caseId}} has exceeded SLA',
      body: `ALERT: Case has breached SLA!

Case ID: {{caseId}}
Title: {{title}}
Priority: {{priority}}
Assignee: {{assignee}}
Time Elapsed: {{timeElapsed}}
SLA Deadline: {{slaDeadline}}

Immediate action required!
View case: {{caseUrl}}`,
      variables: ['caseId', 'title', 'priority', 'assignee', 'timeElapsed', 'slaDeadline', 'caseUrl'],
      channels: ['email', 'slack', 'teams'],
      priority: 'HIGH'
    });

    // Case Escalated Template
    this.templates.set('case-escalated', {
      id: 'case-escalated',
      name: 'Case Escalated',
      description: 'Notification when a case is escalated',
      subject: 'Case Escalated: {{caseId}} - Level {{escalationLevel}}',
      body: `Case has been escalated:

Case ID: {{caseId}}
Title: {{title}}
Priority: {{priority}}
Escalation Level: {{escalationLevel}}
Escalated To: {{escalatedTo}}
Reason: {{reason}}

Please review immediately.
View case: {{caseUrl}}`,
      variables: ['caseId', 'title', 'priority', 'escalationLevel', 'escalatedTo', 'reason', 'caseUrl'],
      channels: ['email', 'slack', 'pagerduty'],
      priority: 'CRITICAL'
    });

    // Threat Detected Template
    this.templates.set('threat-detected', {
      id: 'threat-detected',
      name: 'Threat Detected',
      description: 'Alert for new threat detection',
      subject: 'Threat Detected: {{threatType}} - {{severity}}',
      body: `A new threat has been detected:

Threat ID: {{threatId}}
Type: {{threatType}}
Severity: {{severity}}
Indicator: {{indicator}}
Source: {{source}}
Confidence: {{confidence}}%

Automated response: {{automatedResponse}}
View threat: {{threatUrl}}`,
      variables: ['threatId', 'threatType', 'severity', 'indicator', 'source', 'confidence', 'automatedResponse', 'threatUrl'],
      channels: ['email', 'slack'],
      priority: 'HIGH'
    });

    // Critical Alert Template
    this.templates.set('critical-alert', {
      id: 'critical-alert',
      name: 'Critical Alert',
      description: 'Critical security alert requiring immediate attention',
      subject: 'CRITICAL ALERT: {{alertTitle}}',
      body: `CRITICAL SECURITY ALERT

Alert: {{alertTitle}}
Severity: CRITICAL
Time: {{timestamp}}

Details:
{{details}}

Immediate action required!
Contact: Security Operations Center`,
      variables: ['alertTitle', 'timestamp', 'details'],
      channels: ['email', 'slack', 'teams', 'pagerduty', 'sms'],
      priority: 'CRITICAL'
    });

    // Daily Summary Template
    this.templates.set('daily-summary', {
      id: 'daily-summary',
      name: 'Daily Security Summary',
      description: 'Daily summary of security events',
      subject: 'Daily Security Summary - {{date}}',
      body: `Daily Security Summary for {{date}}

Cases:
- Open: {{openCases}}
- Closed: {{closedCases}}
- SLA Breaches: {{slaBreaches}}

Threats:
- New Threats: {{newThreats}}
- Critical: {{criticalThreats}}
- High: {{highThreats}}

Actions Taken:
- Playbooks Executed: {{playbooksExecuted}}
- IOCs Blocked: {{iocsBlocked}}
- Incidents Resolved: {{incidentsResolved}}

View dashboard: {{dashboardUrl}}`,
      variables: ['date', 'openCases', 'closedCases', 'slaBreaches', 'newThreats', 'criticalThreats', 'highThreats', 'playbooksExecuted', 'iocsBlocked', 'incidentsResolved', 'dashboardUrl'],
      channels: ['email'],
      priority: 'LOW'
    });

    // Playbook Completed Template
    this.templates.set('playbook-completed', {
      id: 'playbook-completed',
      name: 'Playbook Completed',
      description: 'Notification when a playbook execution completes',
      subject: 'Playbook Completed: {{playbookName}}',
      body: `Playbook execution completed:

Playbook: {{playbookName}}
Execution ID: {{executionId}}
Status: {{status}}
Case ID: {{caseId}}
Started: {{startTime}}
Completed: {{completedTime}}
Duration: {{duration}}

Actions Executed: {{actionsExecuted}}
Successful: {{successfulActions}}
Failed: {{failedActions}}

{{executionSummary}}

View results: {{resultsUrl}}`,
      variables: ['playbookName', 'executionId', 'status', 'caseId', 'startTime', 'completedTime', 'duration', 'actionsExecuted', 'successfulActions', 'failedActions', 'executionSummary', 'resultsUrl'],
      channels: ['email', 'slack'],
      priority: 'MEDIUM'
    });
  }

  static async sendNotification(
    templateId: string,
    recipients: string[],
    variables: Record<string, any>,
    metadata?: Notification['metadata']
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Render template with variables
    const subject = this.renderTemplate(template.subject, variables);
    const body = this.renderTemplate(template.body, variables);

    const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      id: notificationId,
      templateId,
      recipients,
      subject,
      body,
      priority: template.priority,
      channels: template.channels,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      metadata: metadata || {}
    };

    this.notifications.set(notificationId, notification);

    // Send through appropriate channels
    this.deliverNotification(notification).catch(err => {
      logger.error('Notification delivery error:', err);
      notification.status = 'FAILED';
      notification.error = err.message;
    });

    return notificationId;
  }

  static async sendCustomNotification(
    recipients: string[],
    subject: string,
    body: string,
    priority: Notification['priority'],
    channels: string[],
    metadata?: Notification['metadata']
  ): Promise<string> {
    const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      id: notificationId,
      recipients,
      subject,
      body,
      priority,
      channels,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      metadata: metadata || {}
    };

    this.notifications.set(notificationId, notification);

    this.deliverNotification(notification).catch(err => {
      logger.error('Notification delivery error:', err);
      notification.status = 'FAILED';
      notification.error = err.message;
    });

    return notificationId;
  }

  private static async deliverNotification(notification: Notification): Promise<void> {
    logger.info(`Delivering notification ${notification.id} via channels: ${notification.channels.join(', ')}`);

    try {
      const deliveryPromises = notification.channels.map(channelId => {
        const channel = this.channels.get(channelId);
        if (!channel || !channel.enabled) {
          logger.warn(`Channel ${channelId} not found or disabled`);
          return Promise.resolve();
        }

        // Check if channel supports this priority
        if (!channel.priority.includes(notification.priority)) {
          logger.info(`Channel ${channelId} does not support priority ${notification.priority}`);
          return Promise.resolve();
        }

        return this.sendToChannel(channel, notification);
      });

      await Promise.all(deliveryPromises);

      notification.status = 'SENT';
      notification.sentAt = new Date().toISOString();

      await AuditService.log(
        notification.metadata.userId || 'SYSTEM',
        'NOTIFICATION_SENT',
        `Notification sent: ${notification.subject}`,
        notification.metadata.caseId || notification.id
      );

      logger.info(`Notification ${notification.id} delivered successfully`);

    } catch (error: any) {
      notification.status = 'FAILED';
      notification.error = error.message;
      throw error;
    }
  }

  private static async sendToChannel(channel: NotificationChannel, notification: Notification): Promise<void> {
    logger.info(`Sending to ${channel.type} channel: ${channel.name}`);

    // Simulate channel-specific delivery
    switch (channel.type) {
      case 'EMAIL':
        await this.sendEmail(channel, notification);
        break;
      case 'SLACK':
        await this.sendSlack(channel, notification);
        break;
      case 'TEAMS':
        await this.sendTeams(channel, notification);
        break;
      case 'PAGERDUTY':
        await this.sendPagerDuty(channel, notification);
        break;
      case 'SMS':
        await this.sendSMS(channel, notification);
        break;
      case 'WEBHOOK':
        await this.sendWebhook(channel, notification);
        break;
      default:
        logger.warn(`Unknown channel type: ${channel.type}`);
    }
  }

  private static async sendEmail(channel: NotificationChannel, notification: Notification): Promise<void> {
    // In production, this would use a real email service (nodemailer, SendGrid, etc.)
    logger.info(`EMAIL: To: ${notification.recipients.join(', ')}, Subject: ${notification.subject}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private static async sendSlack(channel: NotificationChannel, notification: Notification): Promise<void> {
    // In production, this would use Slack API or webhook
    const slackMessage = {
      channel: channel.config.defaultChannel,
      text: notification.subject,
      attachments: [
        {
          color: this.getPriorityColor(notification.priority),
          text: notification.body,
          footer: 'SENTINEL Intelligence Platform',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    logger.info(`SLACK: Posting to ${channel.config.defaultChannel}`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private static async sendTeams(channel: NotificationChannel, notification: Notification): Promise<void> {
    // In production, this would use Teams webhook
    const teamsMessage = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: notification.subject,
      themeColor: this.getPriorityColor(notification.priority),
      title: notification.subject,
      text: notification.body
    };

    logger.info('TEAMS: Posting to webhook');
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private static async sendPagerDuty(channel: NotificationChannel, notification: Notification): Promise<void> {
    // In production, this would use PagerDuty Events API
    const pdEvent = {
      routing_key: channel.config.routingKey,
      event_action: 'trigger',
      payload: {
        summary: notification.subject,
        severity: notification.priority.toLowerCase(),
        source: 'SENTINEL',
        custom_details: {
          body: notification.body
        }
      }
    };

    logger.info('PAGERDUTY: Creating incident');
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  private static async sendSMS(channel: NotificationChannel, notification: Notification): Promise<void> {
    // In production, this would use Twilio or similar SMS service
    const smsBody = `${notification.subject}\n\n${notification.body.substring(0, 160)}...`;

    logger.info(`SMS: Sending to ${notification.recipients.length} recipient(s)`);
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  private static async sendWebhook(channel: NotificationChannel, notification: Notification): Promise<void> {
    // In production, this would make HTTP request to webhook URL
    const payload = {
      id: notification.id,
      subject: notification.subject,
      body: notification.body,
      priority: notification.priority,
      recipients: notification.recipients,
      timestamp: notification.createdAt,
      metadata: notification.metadata
    };

    logger.info(`WEBHOOK: Posting to ${channel.config.url}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private static renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });
    return rendered;
  }

  private static getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'LOW': '#36a64f',
      'MEDIUM': '#ff9900',
      'HIGH': '#ff6600',
      'CRITICAL': '#ff0000'
    };
    return colors[priority] || '#808080';
  }

  static getNotification(notificationId: string): Notification | undefined {
    return this.notifications.get(notificationId);
  }

  static getTemplate(templateId: string): NotificationTemplate | undefined {
    return this.templates.get(templateId);
  }

  static getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  static getChannel(channelId: string): NotificationChannel | undefined {
    return this.channels.get(channelId);
  }

  static getAllChannels(): NotificationChannel[] {
    return Array.from(this.channels.values());
  }

  static async updateChannelConfig(channelId: string, config: Record<string, any>): Promise<void> {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Error('Channel not found');

    channel.config = { ...channel.config, ...config };
    logger.info(`Updated channel ${channelId} configuration`);
  }

  static async toggleChannel(channelId: string, enabled: boolean): Promise<void> {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Error('Channel not found');

    channel.enabled = enabled;
    logger.info(`Channel ${channelId} ${enabled ? 'enabled' : 'disabled'}`);
  }
}
