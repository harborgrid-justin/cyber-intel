
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * Integrations Controller
 * Manages third-party integrations (SIEM, SOAR, Threat Intel feeds, etc.)
 */

interface Integration {
  id: string;
  name: string;
  type: string;
  provider: string;
  configuration: {
    apiUrl?: string;
    apiKey?: string;
    apiSecret?: string;
    username?: string;
    password?: string;
    customSettings?: Record<string, any>;
  };
  enabled: boolean;
  autoSync: boolean;
  syncInterval?: number;
  features: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastSync?: Date;
  syncStatus?: 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';
  syncErrors?: string[];
}

const integrations: Map<string, Integration> = new Map();

/**
 * GET /api/v1/integrations
 * Get all integrations
 */
export const getIntegrations = async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;
    const enabled = req.query.enabled;

    let integrationList = Array.from(integrations.values());

    if (type) {
      integrationList = integrationList.filter(i => i.type === type);
    }

    if (enabled !== undefined) {
      integrationList = integrationList.filter(i => i.enabled === (enabled === 'true'));
    }

    // Remove sensitive configuration data
    const sanitizedIntegrations = integrationList.map(i => ({
      ...i,
      configuration: {
        apiUrl: i.configuration.apiUrl,
        hasApiKey: !!i.configuration.apiKey,
        hasApiSecret: !!i.configuration.apiSecret,
        hasCredentials: !!(i.configuration.username && i.configuration.password),
        customSettings: i.configuration.customSettings,
      },
    }));

    res.json({ data: sanitizedIntegrations });
  } catch (err) {
    logger.error('Failed to get integrations', err);
    res.status(500).json({ error: 'Failed to retrieve integrations' });
  }
};

/**
 * GET /api/v1/integrations/:id
 * Get a single integration
 */
export const getIntegrationById = async (req: Request, res: Response) => {
  try {
    const integration = integrations.get(req.params.id);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Sanitize sensitive data
    const sanitized = {
      ...integration,
      configuration: {
        apiUrl: integration.configuration.apiUrl,
        hasApiKey: !!integration.configuration.apiKey,
        hasApiSecret: !!integration.configuration.apiSecret,
        hasCredentials: !!(integration.configuration.username && integration.configuration.password),
        customSettings: integration.configuration.customSettings,
      },
    };

    res.json({ data: sanitized });
  } catch (err) {
    logger.error('Failed to get integration', err);
    res.status(500).json({ error: 'Failed to retrieve integration' });
  }
};

/**
 * POST /api/v1/integrations
 * Create a new integration
 */
export const createIntegration = async (req: Request, res: Response) => {
  try {
    const integration: Integration = {
      id: `integration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncErrors: [],
    };

    integrations.set(integration.id, integration);

    logger.info('Integration created', {
      id: integration.id,
      type: integration.type,
      provider: integration.provider,
    });

    res.status(201).json({ data: integration });
  } catch (err) {
    logger.error('Failed to create integration', err);
    res.status(400).json({ error: 'Failed to create integration' });
  }
};

/**
 * PUT /api/v1/integrations/:id
 * Update an integration
 */
export const updateIntegration = async (req: Request, res: Response) => {
  try {
    const integration = integrations.get(req.params.id);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const updates = req.body;
    Object.assign(integration, updates, { updatedAt: new Date() });

    logger.info('Integration updated', { id: integration.id });

    res.json({ data: integration });
  } catch (err) {
    logger.error('Failed to update integration', err);
    res.status(500).json({ error: 'Failed to update integration' });
  }
};

/**
 * DELETE /api/v1/integrations/:id
 * Delete an integration
 */
export const deleteIntegration = async (req: Request, res: Response) => {
  try {
    const integration = integrations.get(req.params.id);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    integrations.delete(req.params.id);

    logger.info('Integration deleted', { id: req.params.id });

    res.json({ message: 'Integration deleted successfully' });
  } catch (err) {
    logger.error('Failed to delete integration', err);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
};

/**
 * POST /api/v1/integrations/:id/test
 * Test an integration connection
 */
export const testIntegration = async (req: Request, res: Response) => {
  try {
    const integration = integrations.get(req.params.id);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Simulate connection test
    logger.info('Testing integration', {
      id: integration.id,
      provider: integration.provider,
    });

    const testResult = await performIntegrationTest(integration);

    res.json({
      message: 'Integration test completed',
      result: testResult,
    });
  } catch (err) {
    logger.error('Failed to test integration', err);
    res.status(500).json({ error: 'Integration test failed' });
  }
};

/**
 * POST /api/v1/integrations/:id/sync
 * Manually trigger sync for an integration
 */
export const syncIntegration = async (req: Request, res: Response) => {
  try {
    const integration = integrations.get(req.params.id);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    if (!integration.enabled) {
      return res.status(400).json({ error: 'Integration is disabled' });
    }

    const fullSync = req.body.fullSync || false;

    integration.syncStatus = 'IN_PROGRESS';
    integration.lastSync = new Date();

    logger.info('Starting integration sync', {
      id: integration.id,
      fullSync,
    });

    // Simulate sync operation
    setTimeout(async () => {
      const syncResult = await performSync(integration, fullSync);
      integration.syncStatus = syncResult.success ? 'SUCCESS' : 'FAILURE';
      integration.syncErrors = syncResult.errors;
    }, 1000);

    res.json({
      message: 'Sync initiated',
      integrationId: integration.id,
      fullSync,
    });
  } catch (err) {
    logger.error('Failed to sync integration', err);
    res.status(500).json({ error: 'Sync failed' });
  }
};

/**
 * PATCH /api/v1/integrations/:id/toggle
 * Toggle integration enabled status
 */
export const toggleIntegration = async (req: Request, res: Response) => {
  try {
    const integration = integrations.get(req.params.id);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    integration.enabled = !integration.enabled;
    integration.updatedAt = new Date();

    logger.info('Integration toggled', {
      id: integration.id,
      enabled: integration.enabled,
    });

    res.json({ data: integration });
  } catch (err) {
    logger.error('Failed to toggle integration', err);
    res.status(500).json({ error: 'Failed to toggle integration' });
  }
};

/**
 * GET /api/v1/integrations/types
 * Get available integration types
 */
export const getIntegrationTypes = async (req: Request, res: Response) => {
  try {
    const types = [
      {
        type: 'SIEM',
        description: 'Security Information and Event Management',
        providers: ['Splunk', 'QRadar', 'ArcSight', 'LogRhythm'],
      },
      {
        type: 'SOAR',
        description: 'Security Orchestration, Automation and Response',
        providers: ['Palo Alto XSOAR', 'Splunk Phantom', 'IBM Resilient'],
      },
      {
        type: 'THREAT_INTEL',
        description: 'Threat Intelligence Feeds',
        providers: ['MISP', 'ThreatConnect', 'AlienVault OTX', 'VirusTotal'],
      },
      {
        type: 'VULNERABILITY_SCANNER',
        description: 'Vulnerability Scanning Tools',
        providers: ['Nessus', 'Qualys', 'Rapid7', 'OpenVAS'],
      },
      {
        type: 'EDR',
        description: 'Endpoint Detection and Response',
        providers: ['CrowdStrike', 'Carbon Black', 'SentinelOne'],
      },
      {
        type: 'FIREWALL',
        description: 'Firewall Management',
        providers: ['Palo Alto', 'Cisco', 'Fortinet', 'Check Point'],
      },
      {
        type: 'IDS_IPS',
        description: 'Intrusion Detection/Prevention Systems',
        providers: ['Snort', 'Suricata', 'Zeek'],
      },
      {
        type: 'TICKETING',
        description: 'Ticketing Systems',
        providers: ['Jira', 'ServiceNow', 'Zendesk'],
      },
      {
        type: 'CHAT',
        description: 'Communication Platforms',
        providers: ['Slack', 'Microsoft Teams', 'Discord'],
      },
      {
        type: 'EMAIL',
        description: 'Email Services',
        providers: ['SendGrid', 'Mailgun', 'SMTP'],
      },
    ];

    res.json({ data: types });
  } catch (err) {
    logger.error('Failed to get integration types', err);
    res.status(500).json({ error: 'Failed to retrieve types' });
  }
};

// Helper functions
async function performIntegrationTest(integration: Integration): Promise<{ success: boolean; message: string; latency?: number }> {
  // Simulate connection test
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Connection successful',
        latency: Math.floor(Math.random() * 500) + 50,
      });
    }, 500);
  });
}

async function performSync(integration: Integration, fullSync: boolean): Promise<{ success: boolean; errors: string[] }> {
  // Simulate sync operation
  return new Promise((resolve) => {
    setTimeout(() => {
      logger.info('Sync completed', {
        id: integration.id,
        fullSync,
      });
      resolve({
        success: true,
        errors: [],
      });
    }, 2000);
  });
}
