import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { HttpError } from '../middleware/error';
import { logger } from '../utils/logger';

const CHUNK = 50;

/** Referer header required when API key is restricted to HTTP referrers (backend fetch has no browser referer). */
function translateReferrerHeader(): string {
  const explicit = env.GOOGLE_TRANSLATE_REFERER.trim();
  if (explicit) {
    return explicit.endsWith('/') ? explicit : `${explicit}/`;
  }
  const base = env.FRONTEND_URL.trim();
  return base.endsWith('/') ? base : `${base}/`;
}

export const translateTexts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { texts, target, source } = req.body as {
      texts: string[];
      target: string;
      source?: string;
    };

    if (!env.GOOGLE_TRANSLATE_API_KEY) {
      throw new HttpError(
        503,
        'Translation is not configured. Set GOOGLE_TRANSLATE_API_KEY in the backend .env (Cloud Translation API key).',
      );
    }

    const translations: string[] = [];
    const key = encodeURIComponent(env.GOOGLE_TRANSLATE_API_KEY);

    for (let i = 0; i < texts.length; i += CHUNK) {
      const chunk = texts.slice(i, i + CHUNK);
      const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Referer: translateReferrerHeader(),
        },
        body: JSON.stringify({
          q: chunk,
          target,
          source: source ?? 'en',
          format: 'text',
        }),
      });

      if (!r.ok) {
        const errBody = await r.text();
        logger.warn('Google Translate HTTP error', { status: r.status, body: errBody.slice(0, 400) });
        let googleMessage: string | undefined;
        try {
          const parsed = JSON.parse(errBody) as { error?: { message?: string } };
          googleMessage = parsed.error?.message;
        } catch {
          /* ignore */
        }
        throw new HttpError(502, googleMessage ?? 'Translation provider returned an error', {
          status: r.status,
        });
      }

      const json = (await r.json()) as {
        data?: { translations?: { translatedText: string }[] };
      };
      const parts = json.data?.translations?.map((t) => t.translatedText) ?? [];
      if (parts.length !== chunk.length) {
        throw new HttpError(502, 'Unexpected translation response shape');
      }
      translations.push(...parts);
    }

    res.json({ success: true, translations });
  } catch (e) {
    next(e);
  }
};
