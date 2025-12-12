
import { Router } from 'express';
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '../../controllers/campaign.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { campaignSchema } from '../../schemas/validation.schemas';
import { idParamSchema } from '../../validations/common.schemas';
import { defaultLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes
router.get(
  '/',
  requirePermission('campaign', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  listCampaigns
);

router.get(
  '/:id',
  requirePermission('campaign', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getCampaign
);

// POST routes
router.post(
  '/',
  requirePermission('campaign', 'create'),
  validate(campaignSchema),
  defaultLimiter,
  createCampaign
);

// PATCH routes
router.patch(
  '/:id',
  requirePermission('campaign', 'update'),
  validate(campaignSchema),
  defaultLimiter,
  updateCampaign
);

// DELETE routes
router.delete(
  '/:id',
  requirePermission('campaign', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteCampaign
);

export default router;
