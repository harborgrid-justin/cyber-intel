
import { Router } from 'express';
import { listCases, createCase, updateCase } from '../../controllers/case.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { caseSchema, statusUpdateSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('case', 'read'), listCases);
router.post('/', requirePermission('case', 'create'), validate(caseSchema), createCase);
router.patch('/:id', requirePermission('case', 'update'), validate(statusUpdateSchema), updateCase);

export default router;
