
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { Threat, ThreatActor, Case } from '../models/intelligence';

/**
 * Exports Controller
 * Centralized export functionality for all entities
 */

/**
 * POST /api/v1/exports/threats
 * Export threats in specified format
 */
export const exportThreats = async (req: Request, res: Response) => {
  try {
    const format = req.body.format || 'json';
    const filters = req.body.filters || {};

    const threats = await (Threat as any).findAll({ where: filters });

    const exported = await exportData(threats, format, 'threats');

    logger.info('Threats exported', {
      format,
      count: threats.length,
      user: req.user?.username,
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=threats.json');
      res.json(exported);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=threats.csv');
      res.send(exported);
    } else if (format === 'pdf') {
      res.status(501).json({ error: 'PDF export requires additional library' });
    } else {
      res.status(400).json({ error: 'Invalid format' });
    }
  } catch (err) {
    logger.error('Export failed', err);
    res.status(500).json({ error: 'Export failed' });
  }
};

/**
 * POST /api/v1/exports/cases
 * Export cases in specified format
 */
export const exportCases = async (req: Request, res: Response) => {
  try {
    const format = req.body.format || 'json';
    const filters = req.body.filters || {};

    const cases = await (Case as any).findAll({ where: filters });

    const exported = await exportData(cases, format, 'cases');

    logger.info('Cases exported', {
      format,
      count: cases.length,
      user: req.user?.username,
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=cases.json');
      res.json(exported);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=cases.csv');
      res.send(exported);
    } else {
      res.status(400).json({ error: 'Invalid format' });
    }
  } catch (err) {
    logger.error('Export failed', err);
    res.status(500).json({ error: 'Export failed' });
  }
};

/**
 * POST /api/v1/exports/actors
 * Export threat actors in specified format
 */
export const exportActors = async (req: Request, res: Response) => {
  try {
    const format = req.body.format || 'json';
    const filters = req.body.filters || {};

    const actors = await (ThreatActor as any).findAll({ where: filters });

    const exported = await exportData(actors, format, 'actors');

    logger.info('Actors exported', {
      format,
      count: actors.length,
      user: req.user?.username,
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=actors.json');
      res.json(exported);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=actors.csv');
      res.send(exported);
    } else {
      res.status(400).json({ error: 'Invalid format' });
    }
  } catch (err) {
    logger.error('Export failed', err);
    res.status(500).json({ error: 'Export failed' });
  }
};

/**
 * POST /api/v1/exports/custom
 * Export custom query results
 */
export const exportCustom = async (req: Request, res: Response) => {
  try {
    const { entity, filters, format = 'json', fields } = req.body;

    logger.info('Custom export requested', {
      entity,
      format,
      user: req.user?.username,
    });

    res.status(501).json({
      error: 'Custom exports not fully implemented',
      note: 'Please use specific export endpoints',
    });
  } catch (err) {
    logger.error('Custom export failed', err);
    res.status(500).json({ error: 'Export failed' });
  }
};

/**
 * GET /api/v1/exports/history
 * Get export history for the current user
 */
export const getExportHistory = async (req: Request, res: Response) => {
  try {
    // In production, fetch from database
    const history = [
      {
        id: 'exp-1',
        entity: 'threats',
        format: 'csv',
        recordCount: 150,
        createdAt: new Date(Date.now() - 86400000),
        createdBy: req.user?.username,
      },
      {
        id: 'exp-2',
        entity: 'cases',
        format: 'json',
        recordCount: 45,
        createdAt: new Date(Date.now() - 172800000),
        createdBy: req.user?.username,
      },
    ];

    res.json({ data: history });
  } catch (err) {
    logger.error('Failed to get export history', err);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
};

// Helper function to export data
async function exportData(data: any[], format: string, entityName: string): Promise<any> {
  if (format === 'json') {
    return {
      entity: entityName,
      exportedAt: new Date().toISOString(),
      count: data.length,
      data,
    };
  } else if (format === 'csv') {
    return convertToCSV(data);
  }
  throw new Error('Unsupported format');
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const flatData = data.map(item => flattenObject(item));
  const headers = Array.from(new Set(flatData.flatMap(obj => Object.keys(obj))));
  const csvRows = [headers.join(',')];

  for (const row of flatData) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      return value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

function flattenObject(obj: any, prefix: string = ''): any {
  const flattened: any = {};

  for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) {
      flattened[prefix + key] = obj[key];
    } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
      Object.assign(flattened, flattenObject(obj[key], prefix + key + '_'));
    } else if (Array.isArray(obj[key])) {
      flattened[prefix + key] = obj[key].join('; ');
    } else {
      flattened[prefix + key] = obj[key];
    }
  }

  return flattened;
}
