import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
    path: req.originalUrl,
    method: req.method,
    hint: 'VoteWise routes are under /api. Try GET /api or GET /api/health. The web UI is served from Vercel, not Render.',
  });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.flatten(),
    });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ success: false, error: err.message, details: err.details });
    return;
  }
  logger.error('Unhandled error', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
};
