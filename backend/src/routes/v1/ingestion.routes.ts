
import { Router } from 'express';
import { parseData } from '../../controllers/ingestion.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/parse', parseData);

export default router;
