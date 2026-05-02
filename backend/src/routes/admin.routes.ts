import { Router } from 'express';
import { analytics } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/analytics', authenticate, requireRole('admin'), analytics);

export default router;
