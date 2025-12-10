
import { Router } from 'express';
import { getThreats, getThreatById, createThreat, updateThreatStatus } from '../../controllers/threat.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('threat', 'read'), getThreats);
router.get('/:id', requirePermission('threat', 'read'), getThreatById);

router.post('/', requirePermission('threat', 'create'), createThreat);
router.patch('/:id/status', requirePermission('threat', 'update'), updateThreatStatus);

export default router;
