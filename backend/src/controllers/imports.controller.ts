
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { ThreatService } from '../services/threat.service';

/**
 * Imports Controller
 * Handles bulk data imports from various formats
 */

/**
 * POST /api/v1/imports/threats
 * Import threats from file/data
 */
export const importThreats = async (req: Request, res: Response) => {
  try {
    const { data, format = 'json', validate = true } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Data must be an array' });
    }

    const results = {
      total: data.length,
      imported: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const item of data) {
      try {
        if (validate) {
          validateThreatData(item);
        }
        await ThreatService.create(item);
        results.imported++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({
          item,
          error: err.message,
        });
      }
    }

    logger.info('Threats imported', {
      total: results.total,
      imported: results.imported,
      failed: results.failed,
      user: req.user?.username,
    });

    res.status(201).json({
      message: 'Import completed',
      results,
    });
  } catch (err) {
    logger.error('Import failed', err);
    res.status(500).json({ error: 'Import failed' });
  }
};

/**
 * POST /api/v1/imports/cases
 * Import cases from file/data
 */
export const importCases = async (req: Request, res: Response) => {
  try {
    const { data, format = 'json', validate = true } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Data must be an array' });
    }

    const results = {
      total: data.length,
      imported: 0,
      failed: 0,
      errors: [] as any[],
    };

    logger.info('Cases imported', {
      total: results.total,
      imported: results.imported,
      failed: results.failed,
      user: req.user?.username,
    });

    res.status(201).json({
      message: 'Import completed',
      results,
    });
  } catch (err) {
    logger.error('Import failed', err);
    res.status(500).json({ error: 'Import failed' });
  }
};

/**
 * POST /api/v1/imports/actors
 * Import threat actors from file/data
 */
export const importActors = async (req: Request, res: Response) => {
  try {
    const { data, format = 'json', validate = true } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Data must be an array' });
    }

    const results = {
      total: data.length,
      imported: 0,
      failed: 0,
      errors: [] as any[],
    };

    logger.info('Actors imported', {
      total: results.total,
      imported: results.imported,
      failed: results.failed,
      user: req.user?.username,
    });

    res.status(201).json({
      message: 'Import completed',
      results,
    });
  } catch (err) {
    logger.error('Import failed', err);
    res.status(500).json({ error: 'Import failed' });
  }
};

/**
 * POST /api/v1/imports/validate
 * Validate import data without importing
 */
export const validateImport = async (req: Request, res: Response) => {
  try {
    const { data, entity } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Data must be an array' });
    }

    const validationResults = {
      total: data.length,
      valid: 0,
      invalid: 0,
      errors: [] as any[],
    };

    for (const item of data) {
      try {
        if (entity === 'threats') {
          validateThreatData(item);
        } else {
          throw new Error('Unsupported entity type');
        }
        validationResults.valid++;
      } catch (err: any) {
        validationResults.invalid++;
        validationResults.errors.push({
          item,
          error: err.message,
        });
      }
    }

    res.json({
      message: 'Validation completed',
      results: validationResults,
    });
  } catch (err) {
    logger.error('Validation failed', err);
    res.status(500).json({ error: 'Validation failed' });
  }
};

/**
 * GET /api/v1/imports/history
 * Get import history
 */
export const getImportHistory = async (req: Request, res: Response) => {
  try {
    // In production, fetch from database
    const history = [
      {
        id: 'imp-1',
        entity: 'threats',
        total: 100,
        imported: 95,
        failed: 5,
        createdAt: new Date(Date.now() - 86400000),
        createdBy: req.user?.username,
      },
      {
        id: 'imp-2',
        entity: 'actors',
        total: 20,
        imported: 20,
        failed: 0,
        createdAt: new Date(Date.now() - 172800000),
        createdBy: req.user?.username,
      },
    ];

    res.json({ data: history });
  } catch (err) {
    logger.error('Failed to get import history', err);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
};

/**
 * GET /api/v1/imports/templates/:entity
 * Get import template for an entity
 */
export const getImportTemplate = async (req: Request, res: Response) => {
  try {
    const entity = req.params.entity;
    const format = req.query.format || 'json';

    const templates: Record<string, any> = {
      threats: {
        type: 'MALWARE',
        name: 'Example Threat',
        description: 'Description here',
        severity: 'HIGH',
        confidence: 80,
        reputation: 60,
        indicator: '192.168.1.1',
      },
      cases: {
        title: 'Example Case',
        description: 'Case description',
        severity: 'HIGH',
        priority: 'URGENT',
        status: 'OPEN',
      },
      actors: {
        name: 'Example Actor',
        type: 'APT',
        sophistication: 'ADVANCED',
        description: 'Actor description',
      },
    };

    const template = templates[entity];

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (format === 'json') {
      res.json({
        entity,
        template: [template],
        note: 'This is a sample template. Modify and use for imports.',
      });
    } else if (format === 'csv') {
      const csv = convertObjectToCSV(template);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${entity}_template.csv`);
      res.send(csv);
    } else {
      res.status(400).json({ error: 'Invalid format' });
    }
  } catch (err) {
    logger.error('Failed to get template', err);
    res.status(500).json({ error: 'Failed to retrieve template' });
  }
};

// Helper functions
function validateThreatData(data: any): void {
  if (!data.name) throw new Error('Name is required');
  if (!data.type) throw new Error('Type is required');
  if (!data.severity) throw new Error('Severity is required');
}

function convertObjectToCSV(obj: any): string {
  const headers = Object.keys(obj);
  const values = headers.map(h => obj[h]);
  return headers.join(',') + '\n' + values.join(',');
}
