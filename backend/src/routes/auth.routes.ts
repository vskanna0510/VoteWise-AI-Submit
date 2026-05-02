import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimit';
import { authenticate } from '../middleware/auth';
import { registerSchema, loginSchema } from '../validators/auth.schema';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/me', authenticate, me);

export default router;
