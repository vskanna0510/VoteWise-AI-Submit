import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { MYTHS } from '../data/myths';
import { useUserContext } from '../hooks/useUserContext';
import { useKeyedStrings } from '../hooks/useLocalizedTexts';
import { useTranslatedMyths } from '../hooks/useTranslatedEntities';

const MH: Record<string, string> = {
  eyebrow: 'Myth vs Fact',
  mythLead: 'Bust the',
  mythGlow: 'election myths.',
  sub: 'Tap any card to flip from a common myth to the verified fact, with its source.',
  mythChip: 'MYTH',
  factChip: 'FACT',
  tapHint: 'Tap to reveal the fact →',
};

export const MythVsFactPage = () => {
  const { ctx } = useUserContext();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const u = useKeyedStrings(MH);
  const myths = useTranslatedMyths(MYTHS, ctx.language);
  const toggle = (id: string) => setFlipped((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div>
      <PageHeader
        eyebrow={u.eyebrow}
        title={
          <>
            {u.mythLead} <span className="gradient-text">{u.mythGlow}</span>
          </>
        }
        subtitle={u.sub}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {myths.map((m, i) => {
          const isFlipped = !!flipped[m.id];
          return (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="relative h-64 text-left perspective focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-3xl"
              style={{ perspective: 1000 }}
              aria-pressed={isFlipped}
              aria-label={`${isFlipped ? 'Hide fact for' : 'Reveal fact for'}: ${m.myth}`}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="absolute inset-0 glass rounded-3xl p-6 flex flex-col"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="chip self-start bg-amber-500/10 border-amber-400/30 text-amber-200">
                    <Lightbulb size={12} /> {u.mythChip}
                  </span>
                  <p className="mt-4 text-lg font-display font-semibold text-white leading-snug">{m.myth}</p>
                  <p className="mt-auto text-xs text-slate-400">{u.tapHint}</p>
                </div>
                <div
                  className="absolute inset-0 glass rounded-3xl p-6 flex flex-col bg-gradient-to-br from-emerald-500/15 to-brand-600/20 border-emerald-400/30"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="chip self-start bg-emerald-500/15 border-emerald-400/30 text-emerald-200">
                    <ShieldCheck size={12} /> {u.factChip}
                  </span>
                  <p className="mt-3 text-sm text-slate-100 leading-relaxed">{m.fact}</p>
                  <p className="mt-auto text-xs text-emerald-200/80">Source: {m.source}</p>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
