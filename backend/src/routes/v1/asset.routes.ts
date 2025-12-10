
import { Router } from 'express';
import { listAssets, createAsset, updateAssetStatus } from '../../controllers/asset.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { assetSchema, statusUpdateSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);
router.get('/', listAssets);
router.post('/', validate(assetSchema), createAsset);
router.patch('/:id/status', validate(statusUpdateSchema), updateAssetStatus);

export default router;
