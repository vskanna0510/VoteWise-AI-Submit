import dotenv from 'dotenv';
dotenv.config();

/** Match browser Origin headers (never include a trailing slash). */
const normalizeOriginUrl = (v: string): string => v.trim().replace(/\/+$/, '');

const required = (name: string, fallback?: string): string => {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
};

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',

  FRONTEND_URL: normalizeOriginUrl(process.env.FRONTEND_URL ?? 'http://localhost:5173'),

  /** Extra allowed CORS origins (comma-separated). Use for alternate Vercel preview URLs etc. */
  ADDITIONAL_CORS_ORIGINS: (process.env.ADDITIONAL_CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => normalizeOriginUrl(o))
    .filter(Boolean),

  /**
   * If true: allow https://*.vercel.app origins (covers preview deploys whose URL differs from production).
   * Safer alternative: leave false and list exact URLs in ADDITIONAL_CORS_ORIGINS.
   */
  ALLOW_VERCEL_PREVIEW_ORIGINS: ['1', 'true', 'yes'].includes(
    (process.env.ALLOW_VERCEL_PREVIEW_ORIGINS ?? '').trim().toLowerCase()
  ),

  MONGO_URI: required('MONGO_URI', 'mongodb://localhost:27017/votewise_ai'),

  JWT_SECRET: required('JWT_SECRET', 'votewise_dev_secret_change_me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),

  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',

  /** Cloud Translation API v2 — same key type as frontend VITE_GOOGLE_TRANSLATE_API_KEY */
  GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY ?? '',

  /**
   * When your Cloud key uses "Website" HTTP referrer restrictions, Google rejects server calls
   * without a matching Referer. We send Referer from this URL (with trailing slash) on translate requests.
   * Set this explicitly on Render if keys differ — e.g. https://YOUR_PRODUCTION.vercel.app/
   */
  GOOGLE_TRANSLATE_REFERER: process.env.GOOGLE_TRANSLATE_REFERER ?? '',

  /**
   * If true: do **not** send a `Referer` header on Translation requests (Node has no browser referer anyway).
   * Only works when the key’s **Application restrictions** in GCP are **None**. If Application = "HTTP referrers",
   * Google treats missing Referer as "<empty>" and rejects with API_KEY_HTTP_REFERRER_BLOCKED.
   */
  GOOGLE_TRANSLATE_OMIT_REFERRER: ['1', 'true', 'yes'].includes(
    (process.env.GOOGLE_TRANSLATE_OMIT_REFERRER ?? '').trim().toLowerCase()
  ),

  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@votewise.ai',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD ?? 'Admin@123',
  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME ?? 'Election Admin',
} as const;

/** True if env.FRONTEND_URL host is a Vercel app host (production or preview family). */
export const frontendHostnameIsVercelApp = (): boolean => {
  try {
    const h = new URL(env.FRONTEND_URL).hostname.toLowerCase();
    return h.endsWith('.vercel.app') && h !== 'vercel.app';
  } catch {
    return false;
  }
};
