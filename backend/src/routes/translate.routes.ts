import { Router } from 'express';
import { translateTexts } from '../controllers/translate.controller';
import { validateBody } from '../middleware/validate';
import { translateBodySchema } from '../validators/translate.schema';

const router = Router();

router.post('/', validateBody(translateBodySchema), translateTexts);

export default router;
