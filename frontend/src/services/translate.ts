/**
 * UI translation via backend proxy → Google Cloud Translation API v2.
 * The browser cannot call Google Translate directly (CORS); keep the API key only on the server.
 */

import axios from 'axios';
import { api } from './api';
import type { Language } from '../data/types';

const MOCK: Partial<Record<Language, Record<string, string>>> = {
  hi: {
    'AI Assistant': 'एआई सहायक',
    Timeline: 'समयरेखा',
    Simulator: 'सिमुलेटर',
    Checklist: 'चेकलिस्ट',
    Quiz: 'क्विज़',
    'Myth vs Fact': 'मिथ बनाम तथ्य',
    Evaluation: 'मूल्यांकन',
  },
};

const cache = new Map<string, string>();

const cacheKey = (target: Language, text: string): string => `${target}\u001f${text}`;

/** Server validates max 100 strings per body — chunk to stay safe after dedupe. */
const REQUEST_CHUNK = 70;

/** One POST at a time — language changes fan out many hooks at once; bursts can 429 or race timeouts. */
let translateGate: Promise<void> = Promise.resolve();

function enqueueTranslate<T>(task: () => Promise<T>): Promise<T> {
  const run = translateGate.then(() => task());
  translateGate = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function postTranslate(slice: string[], target: Language): Promise<string[]> {
  return enqueueTranslate(async () => {
    const { data } = await api.post<{ success: boolean; translations: string[] }>(
      '/translate',
      {
        texts: slice,
        target,
        source: 'en',
      },
      /** Landing / quiz / timeline batches can be large; default api timeout is 15s. */
      { timeout: 60_000 },
    );
    if (!data.translations || data.translations.length !== slice.length) {
      throw new Error('Translation response length mismatch');
    }
    return data.translations;
  });
}

/** Batch-translate preserving order (deduped network for uncached lines). */
export async function translateBatch(texts: string[], target: Language): Promise<string[]> {
  if (target === 'en' || texts.length === 0) return [...texts];

  const toRequest: string[] = [];
  for (const t of texts) {
    const ck = cacheKey(target, t);
    if (!cache.has(ck) && !toRequest.includes(t)) toRequest.push(t);
  }

  if (toRequest.length > 0) {
    try {
      for (let i = 0; i < toRequest.length; i += REQUEST_CHUNK) {
        const slice = toRequest.slice(i, i + REQUEST_CHUNK);
        const translated = await postTranslate(slice, target);
        slice.forEach((orig, j) => {
          cache.set(cacheKey(target, orig), translated[j]?.trim() ?? orig);
        });
      }
    } catch (e: unknown) {
      if (import.meta.env.DEV && axios.isAxiosError(e)) {
        // eslint-disable-next-line no-console
        console.warn('[translate] POST /translate failed:', e.response?.status, e.response?.data ?? e.message);
      }
      return texts.map((t) => MOCK[target]?.[t] ?? t);
    }
  }

  return texts.map((t) => cache.get(cacheKey(target, t)) ?? MOCK[target]?.[t] ?? t);
}

export async function translateText(text: string, target: Language): Promise<string> {
  const [out] = await translateBatch([text], target);
  return out ?? text;
}
