import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles, Bot, Calendar, ListChecks, Trophy, ShieldCheck,
  ArrowRight, Languages, Accessibility, Map as MapIcon,
} from 'lucide-react';
import { Card } from '../components/Card';
import { useKeyedStrings } from '../hooks/useLocalizedTexts';

const FEATURES = [
  { icon: Bot, title: 'Smart AI Assistant', text: 'Role-aware help — first-time voter, student, officer, candidate, admin.' },
  { icon: Calendar, title: 'Interactive Timeline', text: 'Walk through 8 election stages from announcement to result.' },
  { icon: ListChecks, title: 'Voter Checklist', text: 'Personalised tasks with progress tracking + Google Calendar reminders.' },
  { icon: Trophy, title: 'Quiz + Certificate', text: 'Test your knowledge and earn a downloadable VoteWise certificate.' },
  { icon: ShieldCheck, title: 'Politically Neutral', text: 'Built-in guardrails refuse partisan prompts. Process only.' },
  { icon: Accessibility, title: 'Accessibility First', text: 'Dyslexia mode, high contrast, font scaling, keyboard nav, ARIA.' },
  { icon: Languages, title: 'Multi-language', text: 'English, Hindi, Tamil, Telugu, Bengali, Marathi via Google Translate.' },
  { icon: MapIcon, title: 'Polling Booth Map', text: 'Locate the booth nearest to you with Google Maps.' },
];

/** Frozen copy — insertion order preserved for keyed translation */
const LD = {
  chip: 'AI-powered · Politically neutral · Open source',
  h1a: 'Understand the',
  h1b: 'election process',
  h1c: 'without the spin.',
  subtitle:
    'VoteWise AI is your friendly, accessible companion to learn how elections work — registration, voting, EVMs, the timeline, and more. We never tell you who to vote for.',
  btnAssistant: 'Talk to VoteWise AI',
  btnTimeline: 'Explore the Timeline',
  badgeECI: 'Election Commission verified',
  badgePrivacy: 'Zero personalisation',
  badgeParty: 'No party endorsement',
  badgeWCAG: 'WCAG 2.1 AA target',
  demoUser1: 'I just turned 18 — how do I register?',
  demoBot1:
    "Welcome! Here's your 4-step plan: 1. Visit NVSP / Voter Helpline app. 2. Fill Form 6. 3. Upload age & address proof. 4. Track your EPIC delivery (2–4 weeks).",
  demoUser2: 'Which party should I support?',
  demoBot2:
    "I'm here to help you understand the election process in a neutral way. I can't recommend candidates, parties, or how you should vote.",
  featsHeadA: 'Built for',
  featsHeadB: 'every kind of citizen',
  featsSub:
    'One platform — many roles. Adaptive content for first-time voters, students, officers, candidates, and admins.',
  ctaTitle: 'Ready to become an informed voter?',
  ctaBody: 'Take the 10-question quiz and earn your certificate in under 2 minutes.',
  ctaQuiz: 'Start the quiz',
  ctaChecklist: 'Open my checklist',
  ...FEATURES.reduce<Record<string, string>>((acc, f, i) => {
    acc[`f${i}_t`] = f.title;
    acc[`f${i}_x`] = f.text;
    return acc;
  }, {}),
};

type LKey = keyof typeof LD;

export const LandingPage = () => {
  const t = useKeyedStrings(LD as Record<string, string>);

  const featureCards = FEATURES.map((f, i) => ({
    ...f,
    title: t[`f${i}_t` as LKey],
    text: t[`f${i}_x` as LKey],
  }));

  return (
    <div>
      <section className="relative pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          <span className="chip mb-5 bg-brand-500/10 border-brand-500/40 text-brand-200">
            <Sparkles size={12} /> {t.chip}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            {t.h1a}{' '}
            <span className="gradient-text">{t.h1b}</span>
            <br />
            {t.h1c}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">{t.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/assistant" className="btn-primary text-base">
              {t.btnAssistant} <ArrowRight size={16} />
            </Link>
            <Link to="/timeline" className="btn-ghost text-base">
              {t.btnTimeline}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2 text-xs">
            {[t.badgeECI, t.badgePrivacy, t.badgeParty, t.badgeWCAG].map((line) => (
              <span key={line} className="chip">
                {line}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 relative max-w-4xl mx-auto"
        >
          <div className="glass-strong rounded-3xl p-1.5 shadow-glow">
            <div className="rounded-[20px] bg-navy-900/80 p-6 sm:p-8">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-xs text-slate-400">votewise.ai / assistant</span>
              </div>
              <div className="space-y-3 text-sm">
                <Bubble who="user">{t.demoUser1}</Bubble>
                <Bubble who="bot">{t.demoBot1}</Bubble>
                <Bubble who="user">{t.demoUser2}</Bubble>
                <Bubble who="bot" refused>
                  {t.demoBot2}
                </Bubble>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            {t.featsHeadA} <span className="gradient-text">{t.featsHeadB}</span>
          </h2>
          <p className="mt-3 text-slate-300">{t.featsSub}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((f, i) => (
            <motion.div
              key={FEATURES[i]?.title ?? featureCards[i].title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-pink flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <Card className="!p-10 text-center bg-gradient-to-br from-brand-700/40 via-accent-pink/15 to-accent-cyan/20 border-brand-400/30">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">{t.ctaTitle}</h3>
          <p className="mt-2 text-slate-300">{t.ctaBody}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/quiz" className="btn-primary">
              <Trophy size={16} /> {t.ctaQuiz}
            </Link>
            <Link to="/checklist" className="btn-ghost">
              <ListChecks size={16} /> {t.ctaChecklist}
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
};

const Bubble = ({ who, children, refused }: { who: 'user' | 'bot'; children: React.ReactNode; refused?: boolean }) => (
  <div className={`flex ${who === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[78%] px-4 py-2.5 rounded-2xl ${
        who === 'user'
          ? 'rounded-br-md bg-gradient-to-r from-brand-600 to-accent-pink text-white'
          : refused
            ? 'rounded-bl-md bg-amber-500/15 border border-amber-400/30 text-amber-100'
            : 'rounded-bl-md bg-white/5 border border-white/10 text-slate-100'
      }`}
    >
      {children}
    </div>
  </div>
);
