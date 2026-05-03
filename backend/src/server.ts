import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { generalLimiter } from './middleware/rateLimit';
import { errorHandler, notFound } from './middleware/error';
import routes from './routes';

/** Allow Vite on any localhost port during dev (5173, 5174, …). */
const isDevLocalhostOrigin = (origin: string): boolean =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const buildApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (origin === env.FRONTEND_URL) {
          callback(null, true);
          return;
        }
        if (env.NODE_ENV === 'development' && isDevLocalhostOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));
  app.use(generalLimiter);

  /** Render / health checks sometimes hit `/` — avoid a bare "Not Found". */
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      service: 'votewise-ai-api',
      message: 'VoteWise AI backend. All HTTP routes live under /api.',
      health: '/api/health',
      example: '/api/health',
    });
  });

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export const app = buildApp();

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      const server = app.listen(env.PORT, () => {
        logger.info(`🗳️  VoteWise AI backend listening on http://localhost:${env.PORT}`);
        logger.info(`Environment: ${env.NODE_ENV}`);
        logger.info(`Frontend allowed origin: ${env.FRONTEND_URL} (+ localhost:* in development)`);
      });
      server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          logger.error(
            `Port ${env.PORT} is already in use. Stop the other process (Task Manager / netstat) or set PORT in .env.`,
            err,
          );
        } else {
          logger.error('Server failed to bind', err);
        }
        process.exit(1);
      });
    } catch (err) {
      logger.error('Failed to start server', err);
      process.exit(1);
    }
  })();
}
