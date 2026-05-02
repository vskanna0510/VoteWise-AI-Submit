import { Router } from 'express';
import { listQuestions, submitQuiz } from '../controllers/quiz.controller';
import { optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { quizSubmitSchema } from '../validators/quiz.schema';

const router = Router();

router.get('/', listQuestions);
router.post('/submit', optionalAuth, validateBody(quizSubmitSchema), submitQuiz);

export default router;
