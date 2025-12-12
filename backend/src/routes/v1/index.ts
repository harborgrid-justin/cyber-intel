
import { Router } from 'express';
import { checkHealth } from '../../controllers/healthController';
import authRoutes from './auth.routes';
import threatRoutes from './threat.routes';
import caseRoutes from './case.routes';
import actorRoutes from './actor.routes';
import campaignRoutes from './campaign.routes';
import auditRoutes from './audit.routes';
import vulnRoutes from './vulnerability.routes';
import feedRoutes from './feed.routes';
import reportRoutes from './report.routes';
import osintRoutes from './osint.routes';
import assetRoutes from './asset.routes';
import responseRoutes from './response.routes';
import evidenceRoutes from './evidence.routes';
import userRoutes from './user.routes';
import vendorRoutes from './vendor.routes';
import messagingRoutes from './messaging.routes';
import dashboardRoutes from './dashboard.routes';
import settingsRoutes from './settings.routes';
import knowledgeRoutes from './knowledge.routes';
import aiRoutes from './ai.routes';
import simulationRoutes from './simulation.routes';
import analysisRoutes from './analysis.routes';
import ingestionRoutes from './ingestion.routes';
import searchRoutes from './search.routes';
// New API endpoints
import analyticsRoutes from './analytics.routes';
import notificationsRoutes from './notifications.routes';
import webhooksRoutes from './webhooks.routes';
import integrationsRoutes from './integrations.routes';
import exportsRoutes from './exports.routes';
import importsRoutes from './imports.routes';
import { getMetrics } from '../../middleware/metrics.middleware';
import { requestLogger, errorLogger } from '../../middleware/logging.middleware';
import { metricsMiddleware } from '../../middleware/metrics.middleware';

const router = Router();

// Apply global middleware
router.use(requestLogger);
router.use(metricsMiddleware);

// Infrastructure
router.get('/health', checkHealth);
router.get('/metrics', getMetrics); // API metrics endpoint

// Authentication (Public routes - must be before other routes)
router.use('/auth', authRoutes);

// Core Modules
router.use('/threats', threatRoutes);
router.use('/cases', caseRoutes);
router.use('/actors', actorRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/audit', auditRoutes);
router.use('/vulnerabilities', vulnRoutes);
router.use('/feeds', feedRoutes);
router.use('/reports', reportRoutes);
router.use('/osint', osintRoutes);
router.use('/assets', assetRoutes);
router.use('/response', responseRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes);
router.use('/messaging', messagingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/ingestion', ingestionRoutes);
router.use('/search', searchRoutes);

// Advanced Modules
router.use('/ai', aiRoutes);
router.use('/simulation', simulationRoutes);
router.use('/analysis', analysisRoutes);

// New Feature Modules
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/integrations', integrationsRoutes);
router.use('/exports', exportsRoutes);
router.use('/imports', importsRoutes);

// Error logging middleware (should be last)
router.use(errorLogger);

export default router;
