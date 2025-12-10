
import { Router } from 'express';
import { listActors, getActor, createActor } from '../../controllers/actor.controller';
import { authenticate, requireClearance } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { actorSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);

router.get('/', listActors);
router.get('/:id', getActor);
router.post('/', requireClearance('SECRET'), validate(actorSchema), createActor);

export default router;
