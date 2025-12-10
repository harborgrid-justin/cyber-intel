
import { Router } from 'express';
import { listReports, createReport, updateReportStatus, generateDraft, getTemplates } from '../../controllers/report.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { reportSchema, statusUpdateSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);
router.get('/', listReports);
router.post('/', validate(reportSchema), createReport);
router.patch('/:id/status', validate(statusUpdateSchema), updateReportStatus);
router.post('/generate-draft', generateDraft);
router.get('/templates', getTemplates);

export default router;
