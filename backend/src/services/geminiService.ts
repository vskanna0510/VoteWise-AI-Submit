/**
 * Gemini Service (placeholder, RAG-ready)
 * --------------------------------------------------------------
 * In production this file makes real REST calls to:
 *   POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 *
 * Right now (no key configured) it returns the DecisionEngine's
 * `recommendedAction` text. Once GEMINI_API_KEY is set, the
 * `callGemini()` function lights up automatically.
 */

import { env } from '../config/env';
import { decide, UserContext } from './decisionEngine';
import { logger } from '../utils/logger';

export interface GeminiResponse {
  text: string;
  source: 'decision-engine' | 'gemini';
  intent: string;
  confidence: number;
  safetyStatus: 'safe' | 'refused' | 'flagged';
  refusalMessage?: string;
  nextStep?: { label: string; route: string; cta: string };
  references?: string[];
}

const SYSTEM_PROMPT = `
You are VoteWise AI — a strictly neutral election-process assistant.
You ONLY explain how elections work (registration, voting, polling, counting,
EVMs, MCC, etc.). You NEVER recommend candidates, parties, or how to vote.
If the user asks for political opinions, refuse politely and redirect to
process-related help. Always cite that information is based on the
Election Commission of India and the Representation of the People Act.
`.trim();

/** Older keys / regions may reject some model IDs with 404; try sensible fallbacks. */
const GEMINI_MODEL_FALLBACKS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

const generateWithModelId = async (modelId: string, prompt: string, context: UserContext): Promise<string> => {
  const model = encodeURIComponent(modelId);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `User context: ${JSON.stringify(context)}\n\nQuestion: ${prompt}`,
          },
        ],
      },
    ],
    generationConfig: { temperature: 0.2, maxOutputTokens: 800 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Gemini returned empty response');
  return text;
};

const callGeminiReal = async (prompt: string, context: UserContext): Promise<string> => {
  const orderedModels = [...new Set([env.GEMINI_MODEL, ...GEMINI_MODEL_FALLBACKS])];
  let lastErr: Error | null = null;
  for (const modelId of orderedModels) {
    try {
      return await generateWithModelId(modelId, prompt, context);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      lastErr = err;
      if (!/^Gemini HTTP 404\b/.test(err.message)) throw err;
      logger.warn('Gemini model unavailable, trying fallback', { modelTried: modelId });
    }
  }
  throw lastErr ?? new Error('Gemini failed');
};

export const askAssistant = async (
  prompt: string,
  context: UserContext = {}
): Promise<GeminiResponse> => {
  const decision = decide(prompt, context);

  // Always honour the safety guard — never call Gemini for refused prompts.
  if (decision.safetyStatus === 'refused') {
    return {
      text: decision.refusalMessage ?? decision.recommendedAction,
      source: 'decision-engine',
      intent: decision.intent,
      confidence: decision.confidence,
      safetyStatus: 'refused',
      refusalMessage: decision.refusalMessage,
      nextStep: decision.nextStep,
      references: decision.references,
    };
  }

  if (env.GEMINI_API_KEY) {
    try {
      const text = await callGeminiReal(prompt, context);
      return {
        text,
        source: 'gemini',
        intent: decision.intent,
        confidence: decision.confidence,
        safetyStatus: decision.safetyStatus,
        nextStep: decision.nextStep,
        references: decision.references,
      };
    } catch (err) {
      logger.warn('Gemini call failed, falling back to decision engine', err);
    }
  }

  return {
    text: decision.recommendedAction,
    source: 'decision-engine',
    intent: decision.intent,
    confidence: decision.confidence,
    safetyStatus: decision.safetyStatus,
    nextStep: decision.nextStep,
    references: decision.references,
  };
};
