import dotenv from 'dotenv';
dotenv.config();

const required = (name: string, fallback?: string): string => {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
};

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  MONGO_URI: required('MONGO_URI', 'mongodb://localhost:27017/votewise_ai'),

  JWT_SECRET: required('JWT_SECRET', 'votewise_dev_secret_change_me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),

  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',

  /** Cloud Translation API v2 — same key type as frontend VITE_GOOGLE_TRANSLATE_API_KEY */
  GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY ?? '',

  /**
   * When your Cloud key uses "Website" HTTP referrer restrictions, Google rejects server calls
   * with an empty referer. We send this Referer header on outbound translate requests —
   * it MUST match one of your allowed referrers (usually your SPA origin ending in / ).
   */
  GOOGLE_TRANSLATE_REFERER: process.env.GOOGLE_TRANSLATE_REFERER ?? '',

  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@votewise.ai',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD ?? 'Admin@123',
  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME ?? 'Election Admin',
} as const;
