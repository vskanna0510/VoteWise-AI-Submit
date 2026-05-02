import { Router } from 'express';
import { listFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faq.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { faqSchema } from '../validators/faq.schema';

const router = Router();

router.get('/', listFaqs);
router.post('/', authenticate, requireRole('admin'), validateBody(faqSchema), createFaq);
router.put('/:id', authenticate, requireRole('admin'), validateBody(faqSchema.partial()), updateFaq);
router.delete('/:id', authenticate, requireRole('admin'), deleteFaq);

export default router;
