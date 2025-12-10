
import { Router } from 'express';
import { getAuditLogs } from '../../controllers/audit.controller';
import { authenticate, requireClearance } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', requireClearance('SECRET'), getAuditLogs);

export default router;
