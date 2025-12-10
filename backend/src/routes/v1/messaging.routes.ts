
import { Router } from 'express';
import { getChannels, getHistory, sendMessage, createChannel } from '../../controllers/messaging.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { messageSchema, channelSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);
router.get('/channels', getChannels);
router.post('/channels', validate(channelSchema), createChannel);
router.get('/channels/:channelId/messages', getHistory);
router.post('/messages', validate(messageSchema), sendMessage);

export default router;
