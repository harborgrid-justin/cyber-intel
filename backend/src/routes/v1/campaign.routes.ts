
import { Router } from 'express';
import { listCampaigns, createCampaign } from '../../controllers/campaign.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { campaignSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);

router.get('/', listCampaigns);
router.post('/', validate(campaignSchema), createCampaign);

export default router;
