import { Router } from 'express';
import authRoutes from './auth.routes';
import faqRoutes from './faq.routes';
import timelineRoutes from './timeline.routes';
import quizRoutes from './quiz.routes';
import chatRoutes from './chat.routes';
import translateRoutes from './translate.routes';
import adminRoutes from './admin.routes';
import { env } from '../config/env';

const router = Router();

/** GET /api — many people try the API base URL on Render. */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'votewise-ai-api',
    message: 'API is up. Use routes under this path.',
    health: '/api/health',
    auth: '/api/auth',
    quiz: '/api/quiz',
    translate: '/api/translate',
    chat: '/api/chat',
  });
});

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: 'votewise-ai-api',
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    features: {
      translation: Boolean(env.GOOGLE_TRANSLATE_API_KEY),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/faqs', faqRoutes);
router.use('/timeline', timelineRoutes);
router.use('/quiz', quizRoutes);
router.use('/chat', chatRoutes);
router.use('/translate', translateRoutes);
router.use('/admin', adminRoutes);

export default router;
