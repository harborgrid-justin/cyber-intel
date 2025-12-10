
import { Router } from 'express';
import { getDashboardStats, getNetworkStats, getComplianceStats } from '../../controllers/dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/stats', getDashboardStats);
router.get('/network', getNetworkStats);
router.post('/compliance', getComplianceStats); // POST to accept controls payload if needed

export default router;
