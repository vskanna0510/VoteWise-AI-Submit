import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { EVALUATION_MATRIX } from '../data/evaluationMatrix';
import { useUserContext } from '../hooks/useUserContext';
import { useKeyedStrings } from '../hooks/useLocalizedTexts';
import { useTranslatedEvaluation } from '../hooks/useTranslatedEntities';

const EV: Record<string, string> = {
  eyebrow: 'Evaluation Matrix',
  titleLead: 'How VoteWise AI ',
  titleGlow: 'scores itself.',
  subtitle: 'A self-audit across nine quality dimensions, with concrete evidence for each.',
  overallLbl: 'Overall',
  criteriaSuffixMid: 'out of 10 — across',
  criteriaSuffixTail: 'criteria',
};

export const EvaluationPage = () => {
  const { ctx } = useUserContext();
  const u = useKeyedStrings(EV);
  const matrix = useTranslatedEvaluation(EVALUATION_MATRIX, ctx.language);

  const overall =
    matrix.reduce((s, c) => s + c.score, 0) / Math.max(matrix.length, 1);

  return (
    <div>
      <PageHeader
        eyebrow={u.eyebrow}
        title={
          <>
            {u.titleLead}
            <span className="gradient-text">{u.titleGlow}</span>
          </>
        }
        subtitle={u.subtitle}
      />

      <Card glow className="!p-8 mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-brand-300">{u.overallLbl}</p>
        <p className="font-display text-6xl font-bold gradient-text">{overall.toFixed(1)}</p>
        <p className="mt-1 text-slate-400">
          {u.criteriaSuffixMid} {matrix.length} {u.criteriaSuffixTail}
        </p>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matrix.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg font-semibold text-white">{c.label}</h3>
                <span className="chip bg-brand-500/15 border-brand-400/40 text-brand-200">
                  <Sparkles size={10} /> {c.score.toFixed(1)}/10
                </span>
              </div>
              <p className="text-sm text-slate-400">{c.description}</p>
              <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${c.score * 10}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-brand-500 via-accent-pink to-accent-cyan"
                />
              </div>
              <ul className="mt-3 space-y-1">
                {c.evidence.map((ev) => (
                  <li key={ev} className="flex items-start gap-1.5 text-xs text-slate-300">
                    <CheckCircle2 size={12} className="mt-0.5 text-emerald-400 shrink-0" />
                    {ev}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
