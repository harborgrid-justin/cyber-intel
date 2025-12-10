
import { Router } from 'express';
import { analyzeThreat } from '../../controllers/ai.controller';
import { authenticate, requireClearance } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { aiPromptSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);
// Higher clearance required for raw AI access to prevent data leakage
router.post('/analyze', requireClearance('SECRET'), validate(aiPromptSchema), analyzeThreat);

export default router;
