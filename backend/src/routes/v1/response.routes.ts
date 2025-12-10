
import { Router } from 'express';
import { listPlaybooks, createPlaybook, runPlaybook } from '../../controllers/response.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { playbookSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);
router.get('/playbooks', listPlaybooks);
router.post('/playbooks', validate(playbookSchema), createPlaybook);
router.post('/playbooks/:id/execute', runPlaybook);

export default router;
