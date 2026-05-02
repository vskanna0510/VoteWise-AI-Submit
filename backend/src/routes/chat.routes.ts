import { Router } from 'express';
import { chat } from '../controllers/chat.controller';
import { optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { chatLimiter } from '../middleware/rateLimit';
import { chatSchema } from '../validators/chat.schema';

const router = Router();

router.post('/', chatLimiter, optionalAuth, validateBody(chatSchema), chat);

export default router;
