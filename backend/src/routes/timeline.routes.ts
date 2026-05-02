import { Router } from 'express';
import { listSteps, createStep, updateStep } from '../controllers/timeline.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { timelineSchema } from '../validators/timeline.schema';

const router = Router();

router.get('/', listSteps);
router.post('/', authenticate, requireRole('admin'), validateBody(timelineSchema), createStep);
router.put('/:id', authenticate, requireRole('admin'), validateBody(timelineSchema.partial()), updateStep);

export default router;
