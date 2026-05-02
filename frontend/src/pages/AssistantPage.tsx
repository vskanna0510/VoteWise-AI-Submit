import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, ShieldAlert, ShieldCheck, RotateCw, ArrowRight, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Markdown } from '../components/Markdown';
import { useChat } from '../hooks/useChat';
import { useUserContext } from '../hooks/useUserContext';
import { useKeyedStrings, useLocalizedTexts } from '../hooks/useLocalizedTexts';
import { ROLE_DISPLAY_ORDER, ROLE_DISPLAY_ENGLISH, ROLE_LABELS } from '../data/checklist';
import { SUGGESTED_PROMPTS } from '../data/suggestedPrompts';
import type { UserRole } from '../data/types';

const AS: Record<string, string> = {
  eyebrow: 'AI Assistant',
  titleAsk: 'Ask me anything ',
  titleGlow: 'about elections.',
  subtitle:
    "I'm trained to explain the process — registration, voting, EVMs, MCC, and more. I never recommend candidates or parties.",
  reset: 'Reset',
  clearAria: 'Clear conversation',
  neutralityBanner:
    'Neutrality enabled. Partisan or persuasive prompts will be refused politely.',
  iAmA: 'I am a…',
  suggestedHeading: 'Suggested prompts',
  guardActivated: 'Neutrality guard activated',
  intent: 'intent:',
  confidence: 'confidence:',
  placeholder: 'Ask about voter registration, EVMs, MCC, polling day…',
  messageAria: 'Message',
  sendAria: 'Send',
  voiceTitle: 'Voice input (browser STT placeholder)',
  voiceAria: 'Voice input',
};

export const AssistantPage = () => {
  const u = useKeyedStrings(AS);
  const roleLbls = useLocalizedTexts(ROLE_DISPLAY_ENGLISH);

  const labelForRole = (id: UserRole) =>
    roleLbls[ROLE_DISPLAY_ORDER.indexOf(id)] ?? ROLE_LABELS[id];

  const { messages, send, busy, reset } = useChat();
  const { ctx, setRole } = useUserContext();
  const [text, setText] = useState('');
  const scroll = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const sugSource = useMemo(
    () => SUGGESTED_PROMPTS[ctx.role] ?? SUGGESTED_PROMPTS.guest,
    [ctx.role],
  );
  const sugDisplay = useLocalizedTexts(sugSource);

  useEffect(() => {
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const raw = text.trim();
    if (!raw) return;
    setText('');
    await send(raw);
  };

  return (
    <div>
      <PageHeader
        eyebrow={u.eyebrow}
        title={
          <>
            {u.titleAsk}
            <span className="gradient-text">{u.titleGlow}</span>
          </>
        }
        subtitle={u.subtitle}
        actions={
          <button type="button" onClick={reset} className="btn-ghost" aria-label={u.clearAria}>
            <RotateCw size={14} /> {u.reset}
          </button>
        }
      />

      <Card className="!p-4 mb-4 flex flex-wrap items-center gap-3 border-emerald-400/30 bg-emerald-500/5">
        <ShieldCheck className="text-emerald-300" size={18} />
        <p className="text-sm text-emerald-100">{u.neutralityBanner}</p>
      </Card>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">{u.iAmA}</h3>
            <div className="space-y-1.5">
              {ROLE_DISPLAY_ORDER.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                    ctx.role === id
                      ? 'bg-gradient-to-r from-brand-600 to-accent-pink text-white shadow-glow'
                      : 'bg-white/5 hover:bg-white/10 text-slate-200'
                  }`}
                  aria-pressed={ctx.role === id}
                >
                  {labelForRole(id)}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-300" /> {u.suggestedHeading}
            </h3>
            <ul className="space-y-1.5">
              {sugSource.map((english, i) => (
                <li key={english}>
                  <button
                    type="button"
                    onClick={() => setText(english)}
                    className="w-full text-left text-xs text-slate-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/5 leading-snug"
                  >
                    {sugDisplay[i] ?? english}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        <Card className="!p-0 overflow-hidden flex flex-col h-[68vh] min-h-[520px]">
          <div ref={scroll} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {messages.map((m) => {
              const refused = m.safetyStatus === 'refused';
              if (m.role === 'user') {
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md bg-gradient-to-r from-brand-600 to-accent-pink text-white shadow-glow">
                      {m.text}
                    </div>
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className={`max-w-[88%] px-4 py-3 rounded-2xl rounded-bl-md border ${
                      refused
                        ? 'bg-amber-500/10 border-amber-400/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {refused && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 mb-2">
                        <ShieldAlert size={12} /> {u.guardActivated}
                      </div>
                    )}
                    <Markdown>{m.text}</Markdown>
                    {m.references && m.references.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {m.references.map((r) => (
                          <span key={r} className="chip text-[11px]">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                    {m.nextStep && (
                      <button
                        type="button"
                        onClick={() => navigate(m.nextStep!.route)}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-200 hover:text-white"
                      >
                        {m.nextStep.cta} <ArrowRight size={14} />
                      </button>
                    )}
                    {typeof m.confidence === 'number' && m.intent && (
                      <p className="mt-2 text-[11px] text-slate-500">
                        {u.intent} <code className="text-brand-300">{m.intent}</code> · {u.confidence}{' '}
                        {(m.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {busy && (
              <div className="flex gap-1 px-4 py-2.5">
                <span className="w-2 h-2 bg-brand-300 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-brand-300 rounded-full animate-bounce"
                  style={{ animationDelay: '120ms' }}
                />
                <span
                  className="w-2 h-2 bg-brand-300 rounded-full animate-bounce"
                  style={{ animationDelay: '240ms' }}
                />
              </div>
            )}
          </div>
          <div className="border-t border-white/10 p-3 sm:p-4">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
                placeholder={u.placeholder}
                className="input"
                aria-label={u.messageAria}
                disabled={busy}
              />
              {ctx.accessibilityPreferences.voiceInput && (
                <button
                  type="button"
                  className="btn-ghost !px-3"
                  title={u.voiceTitle}
                  aria-label={u.voiceAria}
                >
                  <Mic size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={busy || !text.trim()}
                className="btn-primary !px-4"
                aria-label={u.sendAria}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
