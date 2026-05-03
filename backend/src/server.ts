import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env, frontendHostnameIsVercelApp } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { generalLimiter } from './middleware/rateLimit';
import { errorHandler, notFound } from './middleware/error';
import routes from './routes';

/** Allow Vite on any localhost port during dev (5173, 5174, …). */
const isDevLocalhostOrigin = (origin: string): boolean =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

/** Browser Origin is any https deployment on *.vercel.app (preview or production hostname). */
const isVercelAppBrowserOrigin = (origin: string): boolean => {
  try {
    const u = new URL(origin);
    const h = u.hostname.toLowerCase();
    return u.protocol === 'https:' && h.endsWith('.vercel.app') && h !== 'vercel.app';
  } catch {
    return false;
  }
};

const buildApp = () => {
  const app = express();

  /**
   * Never do `Number(process.env.TRUST_PROXY ?? 1)` alone — `TRUST_PROXY=""` on some hosts → 0 → trust off.
   * Default: trust **one** proxy hop (Render, Vercel outbound, etc.).
   */
  const tp = String(process.env.TRUST_PROXY ?? '').trim().toLowerCase();
  const trustProxySetting: boolean | number =
    tp === 'false' || tp === '0' || tp === 'no' ? false : tp === '' ? 1 : Number.parseInt(tp, 10) || 1;
  app.set('trust proxy', trustProxySetting);

  const allowedProductionOrigins = new Set<string>([
    env.FRONTEND_URL,
    ...env.ADDITIONAL_CORS_ORIGINS,
  ]);

  /** Preview URLs differ from production; allow whole Vercel family when configured or when primary UI is on Vercel. */
  const allowVercelDeploymentOrigins =
    env.ALLOW_VERCEL_PREVIEW_ORIGINS || frontendHostnameIsVercelApp();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }
        const o = origin.replace(/\/+$/, '');
        if (allowedProductionOrigins.has(o)) {
          callback(null, true);
          return;
        }
        if (allowVercelDeploymentOrigins && isVercelAppBrowserOrigin(o)) {
          callback(null, true);
          return;
        }
        if (env.NODE_ENV === 'development' && isDevLocalhostOrigin(o)) {
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
      if (process.env.RENDER === 'true' && env.NODE_ENV !== 'production') {
        logger.warn(
          'Running on Render with NODE_ENV≠production — set NODE_ENV=production in Render Environment (CORS, rate limits).',
        );
      }
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
