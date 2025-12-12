
import { Router } from 'express';
import { analyzeThreat } from '../../controllers/ai.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { aiPromptSchema } from '../../schemas/validation.schemas';
import { defaultLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// POST routes - Higher permission required for AI access to prevent data leakage
router.post(
  '/analyze',
  requirePermission('ai', 'analyze'),
  validate(aiPromptSchema),
  defaultLimiter,
  analyzeThreat
);

export default router;
