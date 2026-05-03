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
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (!env.GOOGLE_TRANSLATE_OMIT_REFERRER) {
        headers.Referer = translateReferrerHeader();
      }

      const r = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          q: chunk,
          target,
          source: source ?? 'en',
          format: 'text',
        }),
      });

      if (!r.ok) {
        const errBody = await r.text();
        logger.warn('Google Translate HTTP error', {
          status: r.status,
          omitReferrer: env.GOOGLE_TRANSLATE_OMIT_REFERRER,
          refererSent: env.GOOGLE_TRANSLATE_OMIT_REFERRER ? undefined : translateReferrerHeader(),
          body: errBody.slice(0, 600),
        });
        let googleMessage: string | undefined;
        try {
          const parsed = JSON.parse(errBody) as {
            error?: { message?: string; errors?: { reason?: string; domain?: string }[] };
          };
          googleMessage = parsed.error?.message;
        } catch {
          /* ignore */
        }
        const referrerRestrictedKeyWithEmptyReferer =
          r.status === 403 &&
          env.GOOGLE_TRANSLATE_OMIT_REFERRER &&
          (/\b(empty|EMPTY)\b/.test(errBody) ||
            /<empty>|\\u003cempty\\u003e/i.test(errBody));

        const hint403 = referrerRestrictedKeyWithEmptyReferer
          ? 'Your API key uses Application restriction → HTTP referrers. Empty Referer (<empty>) is never on that whitelist, so the call fails. Fix: edit the key in Google Cloud → Credentials → set Application restrictions to None, API restrictions → restrict to Cloud Translation API only (recommended for backend). Then keep GOOGLE_TRANSLATE_OMIT_REFERRER=true or false. Alternative: delete OMIT_REFERRER (set false), add https://YOUR_APP.vercel.app/* and https://*.vercel.app/* under Website restrictions, set GOOGLE_TRANSLATE_REFERER=https://YOUR_APP.vercel.app/ to match.'
          : 'Google blocked this key (often HTTP referrer whitelist). EITHER add your Vercel URLs in GCP (*.vercel.app + production) and leave GOOGLE_TRANSLATE_OMIT_REFERRER unset/false so we send Referer; OR use a backend key with Application restrictions None + API = Cloud Translation only.';

        const hint =
          r.status === 403
            ? hint403
            : 'Check logs for Google response body; verify GOOGLE_TRANSLATE_API_KEY, Cloud Translation API, and billing.';
        throw new HttpError(
          502,
          googleMessage ?? 'Translation provider returned an error',
          { googleHttpStatus: r.status, hint },
        );
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
