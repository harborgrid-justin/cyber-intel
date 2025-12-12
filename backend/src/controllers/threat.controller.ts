
import { Request, Response } from 'express';
import { ThreatService } from '../services/threat.service';
import { ScoringEngine } from '../services/analysis/scoring.engine';
import { ActorService } from '../services/actor.service';
import { logger } from '../utils/logger';
import { Threat } from '../models/intelligence';
import { Op } from 'sequelize';

/**
 * GET /api/v1/threats
 * Get all threats with pagination, filtering, and sorting
 */
export const getThreats = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || 'last_seen';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    // Build filter object
    const where: any = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.severity) where.severity = req.query.severity;
    if (req.query.type) where.type = req.query.type;
    if (req.query.threatActor) where.threat_actor = req.query.threatActor;
    if (req.query.search) {
      where[Op.or] = [
        { indicator: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const { rows: threats, count } = await (Threat as any).findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      data: threats,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    logger.error('Error fetching threats', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * GET /api/v1/threats/:id
 * Get a single threat by ID
 */
export const getThreatById = async (req: Request, res: Response) => {
  try {
    const threat = await ThreatService.getById(req.params.id);
    if (!threat) return res.status(404).json({ error: 'Threat not found' });
    res.json({ data: threat });
  } catch (err) {
    logger.error('Error fetching threat', err);
    res.status(500).json({ error: 'Database Error' });
  }
};

/**
 * POST /api/v1/threats
 * Create a new threat
 */
export const createThreat = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // 1. Calculate Score Server-Side
    data.score = ScoringEngine.calculateThreatScore(
      data.confidence || 50,
      data.reputation || 50,
      data.severity || 'MEDIUM'
    );

    // 2. Auto-Attribution
    const actors = await ActorService.getAll();
    if (!data.threatActor || data.threatActor === 'Unknown') {
      data.threatActor = await ScoringEngine.autoAttribute({ ...data } as any, actors);
    }

    const newThreat = await ThreatService.create(data);
    logger.info(`Threat created by ${req.user?.username}`, { id: newThreat.id });
    res.status(201).json({ data: newThreat });
  } catch (err) {
    logger.error('Creation failed', err);
    res.status(400).json({ error: 'Invalid Data' });
  }
};

/**
 * PUT /api/v1/threats/:id
 * Update an existing threat
 */
export const updateThreat = async (req: Request, res: Response) => {
  try {
    const threat = await ThreatService.getById(req.params.id);
    if (!threat) return res.status(404).json({ error: 'Threat not found' });

    const updates = req.body;

    // Recalculate score if relevant fields changed
    if (updates.confidence || updates.reputation || updates.severity) {
      updates.score = ScoringEngine.calculateThreatScore(
        updates.confidence || threat.confidence,
        updates.reputation || threat.reputation,
        updates.severity || threat.severity
      );
    }

    await threat.update(updates);
    logger.info(`Threat updated by ${req.user?.username}`, { id: threat.id });
    res.json({ data: threat });
  } catch (err) {
    logger.error('Update failed', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

/**
 * DELETE /api/v1/threats/:id
 * Delete a threat
 */
export const deleteThreat = async (req: Request, res: Response) => {
  try {
    const threat = await ThreatService.getById(req.params.id);
    if (!threat) return res.status(404).json({ error: 'Threat not found' });

    await threat.destroy();
    logger.info(`Threat deleted by ${req.user?.username}`, { id: req.params.id });
    res.json({ message: 'Threat deleted successfully' });
  } catch (err) {
    logger.error('Deletion failed', err);
    res.status(500).json({ error: 'Deletion failed' });
  }
};

/**
 * PATCH /api/v1/threats/:id/status
 * Update threat status
 */
export const updateThreatStatus = async (req: Request, res: Response) => {
  try {
    const updated = await ThreatService.updateStatus(req.params.id, req.body.status);
    if (!updated) return res.status(404).json({ error: 'Threat not found' });
    logger.info(`Threat status updated by ${req.user?.username}`, {
      id: req.params.id,
      status: req.body.status
    });
    res.json({ data: updated });
  } catch (err) {
    logger.error('Status update failed', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

/**
 * POST /api/v1/threats/bulk
 * Create multiple threats in bulk
 */
export const bulkCreateThreats = async (req: Request, res: Response) => {
  try {
    const { threats } = req.body;
    const results = [];
    const errors = [];

    for (const threatData of threats) {
      try {
        // Calculate score for each threat
        threatData.score = ScoringEngine.calculateThreatScore(
          threatData.confidence || 50,
          threatData.reputation || 50,
          threatData.severity || 'MEDIUM'
        );

        const threat = await ThreatService.create(threatData);
        results.push(threat);
      } catch (err: any) {
        errors.push({ data: threatData, error: err.message });
      }
    }

    logger.info(`Bulk threats created by ${req.user?.username}`, {
      created: results.length,
      failed: errors.length
    });

    res.status(201).json({
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: threats.length,
        created: results.length,
        failed: errors.length,
      },
    });
  } catch (err) {
    logger.error('Bulk creation failed', err);
    res.status(400).json({ error: 'Bulk creation failed' });
  }
};

/**
 * PATCH /api/v1/threats/bulk
 * Update multiple threats in bulk
 */
export const bulkUpdateThreats = async (req: Request, res: Response) => {
  try {
    const { ids, updates } = req.body;
    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        const threat = await ThreatService.getById(id);
        if (threat) {
          await threat.update(updates);
          results.push(threat);
        } else {
          errors.push({ id, error: 'Threat not found' });
        }
      } catch (err: any) {
        errors.push({ id, error: err.message });
      }
    }

    logger.info(`Bulk threats updated by ${req.user?.username}`, {
      updated: results.length,
      failed: errors.length
    });

    res.json({
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: ids.length,
        updated: results.length,
        failed: errors.length,
      },
    });
  } catch (err) {
    logger.error('Bulk update failed', err);
    res.status(400).json({ error: 'Bulk update failed' });
  }
};

/**
 * DELETE /api/v1/threats/bulk
 * Delete multiple threats in bulk
 */
export const bulkDeleteThreats = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        const threat = await ThreatService.getById(id);
        if (threat) {
          await threat.destroy();
          results.push(id);
        } else {
          errors.push({ id, error: 'Threat not found' });
        }
      } catch (err: any) {
        errors.push({ id, error: err.message });
      }
    }

    logger.info(`Bulk threats deleted by ${req.user?.username}`, {
      deleted: results.length,
      failed: errors.length
    });

    res.json({
      message: 'Bulk delete completed',
      summary: {
        total: ids.length,
        deleted: results.length,
        failed: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    logger.error('Bulk delete failed', err);
    res.status(400).json({ error: 'Bulk delete failed' });
  }
};

/**
 * GET /api/v1/threats/export
 * Export threats in various formats
 */
export const exportThreats = async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || 'json';
    const threats = await ThreatService.getAll(10000, 0); // Get all threats for export

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=threats.json');
      res.json(threats);
    } else if (format === 'csv') {
      const csv = convertToCSV(threats);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=threats.csv');
      res.send(csv);
    } else if (format === 'pdf') {
      // PDF export would require a PDF library - placeholder response
      res.status(501).json({ error: 'PDF export not yet implemented' });
    } else {
      res.status(400).json({ error: 'Invalid export format' });
    }

    logger.info(`Threats exported by ${req.user?.username}`, { format, count: threats.length });
  } catch (err) {
    logger.error('Export failed', err);
    res.status(500).json({ error: 'Export failed' });
  }
};

/**
 * GET /api/v1/threats/stats
 * Get threat statistics
 */
export const getThreatStats = async (req: Request, res: Response) => {
  try {
    const threats = await ThreatService.getAll(10000, 0);

    const stats = {
      total: threats.length,
      bySeverity: countBy(threats, 'severity'),
      byStatus: countBy(threats, 'status'),
      byType: countBy(threats, 'type'),
      byThreatActor: countBy(threats, 'threat_actor'),
      averageScore: threats.reduce((sum, t) => sum + (t.score || 0), 0) / threats.length || 0,
      averageConfidence: threats.reduce((sum, t) => sum + (t.confidence || 0), 0) / threats.length || 0,
    };

    res.json({ data: stats });
  } catch (err) {
    logger.error('Stats retrieval failed', err);
    res.status(500).json({ error: 'Stats retrieval failed' });
  }
};

// Helper functions
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

function countBy(array: any[], key: string): Record<string, number> {
  return array.reduce((acc, item) => {
    const value = item[key] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}
