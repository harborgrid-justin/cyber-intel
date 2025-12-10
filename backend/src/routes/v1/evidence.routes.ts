
import { Router } from 'express';
import { listEvidence, uploadEvidence, getChain } from '../../controllers/evidence.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { evidenceSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);
router.get('/', listEvidence);
router.post('/', validate(evidenceSchema), uploadEvidence);
router.get('/:id/chain', getChain);

export default router;
