
import { Router } from 'express';
import { listFeeds, addFeed, syncFeed } from '../../controllers/feed.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { feedSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);
router.get('/', listFeeds);
router.post('/', validate(feedSchema), addFeed);
router.post('/:id/sync', syncFeed);

export default router;
