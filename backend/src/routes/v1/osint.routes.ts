
import { Router } from 'express';
import { globalSearch, listBreaches } from '../../controllers/osint.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/search', globalSearch);
router.get('/breaches', listBreaches);

export default router;
