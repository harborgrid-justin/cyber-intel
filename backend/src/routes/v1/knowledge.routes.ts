
import { Router } from 'express';
import { listTechniques, listGroups, syncMitre } from '../../controllers/knowledge.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/techniques', listTechniques);
router.get('/groups', listGroups);
router.post('/sync', syncMitre);

export default router;
