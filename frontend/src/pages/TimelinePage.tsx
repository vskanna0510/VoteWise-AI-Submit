import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone, ShieldCheck, FileSignature, ClipboardCheck,
  Vote, Calculator, Trophy, Calendar as CalendarIcon, ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { fetchTimeline } from '../services/timeline';
import type { TimelineStep } from '../data/types';
import { useUserContext } from '../hooks/useUserContext';
import { useKeyedStrings } from '../hooks/useLocalizedTexts';
import { useTranslatedTimeline } from '../hooks/useTranslatedEntities';

const ICONS: Record<string, LucideIcon> = {
  Megaphone, ShieldCheck, FileSignature, ClipboardCheck, Vote, Calculator, Trophy, Calendar: CalendarIcon,
};

const TP = {
  eyebrow: 'Election Lifecycle',
  title: 'The 8 stages, end to end.',
  subtitle:
    "From the day the Election Commission announces the schedule to the moment the result is declared — here's what happens, in order.",
  loading: 'Loading timeline…',
  step: 'Step',
  daySingular: 'day',
  dayPlural: 'days',
};

export const TimelinePage = () => {
  const { ctx } = useUserContext();
  const u = useKeyedStrings(TP);
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeline()
      .then(setSteps)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const displaySteps = useTranslatedTimeline(steps, ctx.language);

  return (
    <div>
      <PageHeader eyebrow={u.eyebrow} title={<>{u.title}</>} subtitle={u.subtitle} />

      {loading && <p className="text-slate-400">{u.loading}</p>}
      {error && <p className="text-rose-400">⚠️ {error}</p>}

      <div className="relative">
        <div className="absolute left-4 sm:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-brand-500/0 via-brand-500/60 to-accent-pink/40 -translate-x-1/2" />
        <ol className="space-y-8">
          {displaySteps.map((s, i) => {
            const Icon = ICONS[s.icon] ?? CalendarIcon;
            const isLeft = i % 2 === 0;
            return (
              <li key={s.key} id={s.key}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5 }}
                  className={`relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-12 items-center ${
                    isLeft ? '' : 'sm:[&>*:first-child]:order-2'
                  }`}
                >
                  <div className={`${isLeft ? 'sm:text-right sm:pr-8' : 'sm:pl-8'}`}>
                    <Card>
                      <div className={`flex items-center gap-3 ${isLeft ? 'sm:justify-end' : ''}`}>
                        <span
                          className="chip border-0 text-white font-semibold"
                          style={{ background: `linear-gradient(135deg, ${s.color}, #ec4899)` }}
                        >
                          {u.step} {s.order}
                        </span>
                        <span className="chip">
                          {s.durationDays} {s.durationDays !== 1 ? u.dayPlural : u.daySingular}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-white mt-3">{s.title}</h3>
                      <p className="mt-2 text-slate-300 text-sm">{s.shortDescription}</p>
                      <p className="mt-3 text-slate-400 text-sm leading-relaxed">{s.longDescription}</p>
                      {s.resources && s.resources.length > 0 && (
                        <div className={`mt-3 flex flex-wrap gap-2 ${isLeft ? 'sm:justify-end' : ''}`}>
                          {s.resources.map((r) => (
                            <a
                              key={r.url}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="chip hover:bg-white/10 hover:text-white"
                            >
                              {r.label} <ExternalLink size={10} />
                            </a>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>

                  <div className="absolute left-0 sm:left-1/2 top-6 sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center border-2 border-navy-900 shadow-glow"
                      style={{ background: `linear-gradient(135deg, ${s.color}, #ec4899)` }}
                    >
                      <Icon size={18} className="text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
