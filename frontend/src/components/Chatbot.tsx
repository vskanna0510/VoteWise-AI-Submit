import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { useUserContext } from '../hooks/useUserContext';
import { SUGGESTED_PROMPTS } from '../data/suggestedPrompts';
import { Markdown } from './Markdown';

export const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const { messages, send, busy } = useChat();
  const { ctx } = useUserContext();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    await send(t);
  };

  const suggestions = SUGGESTED_PROMPTS[ctx.role] ?? SUGGESTED_PROMPTS.guest;

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="fixed bottom-5 right-5 z-40 rounded-full p-4 bg-gradient-to-br from-brand-600 to-accent-pink shadow-glow text-white"
        aria-label={open ? 'Close VoteWise assistant' : 'Open VoteWise assistant'}
      >
        {open ? <X size={20} /> : <MessageCircle size={22} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="fixed bottom-24 right-5 z-40 w-[min(92vw,400px)] h-[min(72vh,560px)] flex flex-col glass-strong rounded-3xl overflow-hidden"
            role="dialog"
            aria-label="VoteWise AI chat"
          >
            <header className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-700/50 to-accent-pink/30">
              <div>
                <h3 className="font-display font-semibold text-white flex items-center gap-1.5">
                  <Sparkles size={14} /> VoteWise AI
                </h3>
                <p className="text-[11px] text-slate-200/80">Politically neutral · process-only</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-200 hover:text-white" aria-label="Close chat">
                <X size={18} />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
              {messages.map((m) => (
                <ChatBubble key={m.id} m={m} />
              ))}
              {busy && <TypingDots />}
            </div>

            <div className="px-3 pt-1 pb-2 border-t border-white/10">
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {suggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setText(s);
                    }}
                    className="chip whitespace-nowrap hover:bg-white/10 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Ask about voting…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  aria-label="Type your question"
                  disabled={busy}
                />
                <button
                  className="btn-primary !px-3 !py-2"
                  onClick={handleSend}
                  disabled={busy || !text.trim()}
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              </div>
              <button
                className="mt-1 text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
                onClick={() => {
                  setOpen(false);
                  navigate('/assistant');
                }}
              >
                Open full assistant page →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ChatBubble = ({ m }: { m: ReturnType<typeof useChat>['messages'][number] }) => {
  const navigate = useNavigate();
  const refused = m.safetyStatus === 'refused';

  if (m.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-br-md bg-gradient-to-r from-brand-600 to-accent-pink text-white shadow-glow">
          {m.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl rounded-bl-md border ${
          refused ? 'bg-amber-500/10 border-amber-400/30' : 'bg-white/5 border-white/10'
        }`}
      >
        {refused && (
          <div className="flex items-center gap-1.5 text-xs text-amber-300 mb-1.5">
            <ShieldAlert size={12} /> Neutrality guard activated
          </div>
        )}
        <Markdown>{m.text}</Markdown>
        {m.nextStep && (
          <button
            onClick={() => navigate(m.nextStep!.route)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-200 hover:text-white"
          >
            {m.nextStep.cta} <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div className="flex justify-start">
    <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/5 border border-white/10 flex gap-1">
      <Dot delay={0} />
      <Dot delay={0.15} />
      <Dot delay={0.3} />
    </div>
  </div>
);
const Dot = ({ delay }: { delay: number }) => (
  <motion.span
    className="w-1.5 h-1.5 bg-brand-300 rounded-full"
    animate={{ y: [0, -3, 0] }}
    transition={{ duration: 0.8, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);
