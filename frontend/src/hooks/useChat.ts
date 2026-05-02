import { useCallback, useState } from 'react';
import { askGemini } from '../services/gemini';
import { sessionIdFor } from '../utils/format';
import type { ChatMessage } from '../data/types';
import { useUserContext } from './useUserContext';
import { trackEvent } from '../services/analytics';

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi! I'm **VoteWise AI** — your neutral guide to the election process. Ask me anything about registration, voting, EVMs, MCC, or polling-day steps. I never recommend candidates or parties.",
  timestamp: Date.now(),
};

export const useChat = () => {
  const { ctx, appendChatSummary } = useUserContext();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || busy) return;
      setError(null);
      const userMsg: ChatMessage = {
        id: `u_${Date.now()}`,
        role: 'user',
        text: prompt.trim(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setBusy(true);
      try {
        const reply = await askGemini(prompt.trim(), ctx, sessionIdFor());
        setMessages((prev) => [...prev, reply]);
        appendChatSummary(`Q: ${prompt.trim().slice(0, 80)} → ${reply.intent}`);
        trackEvent('chat_message', {
          intent: reply.intent,
          safety: reply.safetyStatus,
          role: ctx.role,
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Something went wrong';
        setError(msg);
        setMessages((prev) => [
          ...prev,
          {
            id: `e_${Date.now()}`,
            role: 'assistant',
            text: `⚠️ Sorry — I couldn't reach the assistant. ${msg}`,
            safetyStatus: 'flagged',
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [ctx, busy, appendChatSummary]
  );

  const reset = useCallback(() => setMessages([WELCOME]), []);

  return { messages, send, busy, error, reset };
};
