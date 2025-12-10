
import { Router } from 'express';
import { listVendors, addVendor } from '../../controllers/vendor.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { vendorSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);
router.get('/', listVendors);
router.post('/', validate(vendorSchema), addVendor);

export default router;
