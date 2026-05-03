import { api } from './api';
import type { ChatMessage, UserContext } from '../data/types';

export interface ChatApiResponse {
  success: boolean;
  text: string;
  source: 'decision-engine' | 'gemini';
  intent: string;
  confidence: number;
  safetyStatus: 'safe' | 'refused' | 'flagged';
  refusalMessage?: string;
  nextStep?: { label: string; route: string; cta: string };
  references?: string[];
  latencyMs: number;
  timestamp: string;
}

export const askGemini = async (
  prompt: string,
  context: UserContext,
  sessionId: string
): Promise<ChatMessage> => {
  const { data } = await api.post<ChatApiResponse>(
    '/chat',
    {
      prompt,
      sessionId,
      context: {
        role: context.role,
        language: context.language,
        learningStage: context.learningStage,
        checklistProgress: context.checklistProgress,
        quizScore: context.quizScore,
        chatHistorySummary: context.chatHistorySummary,
      },
    },
    /** Render wake + Gemini often exceed default 15s client timeout ("Network Error"). */
    { timeout: 120_000 },
  );
  return {
    id: `${data.timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    role: 'assistant',
    text: data.text,
    intent: data.intent,
    confidence: data.confidence,
    safetyStatus: data.safetyStatus,
    nextStep: data.nextStep,
    references: data.references,
    timestamp: Date.parse(data.timestamp) || Date.now(),
  };
};
