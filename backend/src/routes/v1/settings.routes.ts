
import { Router } from 'express';
import { listIntegrations, addIntegration, performMaintenance } from '../../controllers/settings.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { integrationSchema, maintenanceSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);

router.get('/integrations', requirePermission('system', 'config'), listIntegrations);
router.post('/integrations', requirePermission('system', 'config'), validate(integrationSchema), addIntegration);
router.post('/maintenance', requirePermission('system', 'config'), validate(maintenanceSchema), performMaintenance);

export default router;
