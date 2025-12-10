
import { Router } from 'express';
import { listUsers, createUser, updateUserStatus, getCurrentUser } from '../../controllers/user.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { userSchema, statusUpdateSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);

// Current User Context (No permission check needed beyond auth)
router.get('/me', getCurrentUser);

// Only admins can see full user list and details usually, but we allow 'user:read' for directories
router.get('/', requirePermission('user', 'read'), listUsers);

// Only admins or user managers can create/update
router.post('/', requirePermission('user', 'manage'), validate(userSchema), createUser);
router.patch('/:id/status', requirePermission('user', 'manage'), validate(statusUpdateSchema), updateUserStatus);

export default router;
