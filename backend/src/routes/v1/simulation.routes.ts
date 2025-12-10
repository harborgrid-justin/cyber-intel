
import { Router } from 'express';
import { runSimulation, calculateEvasion, calculateExfil } from '../../controllers/simulation.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { simulationSchema } from '../../schemas/validation.schemas';

const router = Router();

router.use(authenticate);
router.post('/run', validate(simulationSchema), runSimulation);
router.post('/evasion', calculateEvasion);
router.post('/exfil', calculateExfil);

export default router;
