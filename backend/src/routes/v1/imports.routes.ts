
import { Router } from 'express';
import {
  importThreats,
  importCases,
  importActors,
  validateImport,
  getImportHistory,
  getImportTemplate,
} from '../../controllers/imports.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { bulkOperationLimiter, defaultLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

router.get(
  '/history',
  requirePermission('imports', 'read'),
  defaultLimiter,
  getImportHistory
);

router.get(
  '/templates/:entity',
  requirePermission('imports', 'read'),
  defaultLimiter,
  getImportTemplate
);

router.post(
  '/validate',
  requirePermission('imports', 'create'),
  defaultLimiter,
  validateImport
);

router.post(
  '/threats',
  requirePermission('threat', 'import'),
  bulkOperationLimiter,
  importThreats
);

router.post(
  '/cases',
  requirePermission('case', 'import'),
  bulkOperationLimiter,
  importCases
);

router.post(
  '/actors',
  requirePermission('actor', 'import'),
  bulkOperationLimiter,
  importActors
);

export default router;
