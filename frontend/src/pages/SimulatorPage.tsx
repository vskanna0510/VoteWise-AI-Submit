import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, ScanLine, Fingerprint, Vote, FileCheck, CheckCircle2, RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { useKeyedStrings, useLocalizedTexts } from '../hooks/useLocalizedTexts';

interface SimStep {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  cta: string;
}

const STEPS: SimStep[] = [
  {
    id: 'arrive',
    icon: ScanLine,
    title: 'You arrive at your booth',
    body: 'Stand in the queue and present your EPIC (Voter ID) or any of the 11 accepted alternate IDs to the First Polling Officer.',
    cta: "I've arrived",
  },
  {
    id: 'verify',
    icon: Fingerprint,
    title: 'ID verification & inking',
    body: 'The Second Polling Officer locates your name on the marked copy of the electoral roll. Indelible ink is applied to your left index finger.',
    cta: 'Get inked',
  },
  {
    id: 'vote',
    icon: Vote,
    title: 'Cast your vote on the EVM',
    body: 'You move into the voting compartment, find the candidates list, and press the blue button next to your choice. The lamp glows red and a beep confirms.',
    cta: 'Press the button',
  },
  {
    id: 'verify-vvpat',
    icon: FileCheck,
    title: 'Verify the VVPAT slip',
    body: 'A printed paper slip appears in the VVPAT window for 7 seconds showing the candidate name, symbol, and serial number you chose. It then drops into a sealed box.',
    cta: 'Confirm slip',
  },
  {
    id: 'done',
    icon: CheckCircle2,
    title: 'You voted!',
    body: 'Your vote is recorded. Total time: 2-3 minutes. The EVM is sealed at the close of poll and counted on result day under multi-party observation.',
    cta: 'Finish simulation',
  },
];

const SIM_STEP_STRINGS = STEPS.flatMap((s) => [s.title, s.body, s.cta]);

const SIM_UI: Record<string, string> = {
  eyebrow: 'Election Simulator',
  titleLead: 'Walk through',
  titleGlow: 'voting day',
  titleTrail: ', step by step.',
  sub: 'An interactive simulation of what actually happens at a polling booth — from queue to VVPAT verification.',
  stepWord: 'Step',
  prev: 'Previous',
  restart: 'Restart',
};

export const SimulatorPage = () => {
  const u = useKeyedStrings(SIM_UI);
  const stepTr = useLocalizedTexts(SIM_STEP_STRINGS);
  const stepsT = useMemo(
    () =>
      STEPS.map((s, i) => ({
        ...s,
        title: stepTr[i * 3] ?? s.title,
        body: stepTr[i * 3 + 1] ?? s.body,
        cta: stepTr[i * 3 + 2] ?? s.cta,
      })),
    [stepTr],
  );

  const [idx, setIdx] = useState(0);
  const step = stepsT[idx]!;
  const Icon = step.icon;
  const progress = ((idx + 1) / stepsT.length) * 100;

  const next = () => setIdx((i) => Math.min(i + 1, stepsT.length - 1));
  const prev = () => setIdx((i) => Math.max(i - 1, 0));
  const reset = () => setIdx(0);

  return (
    <div>
      <PageHeader
        eyebrow={u.eyebrow}
        title={
          <>
            {u.titleLead} <span className="gradient-text">{u.titleGlow}</span>
            {u.titleTrail}
          </>
        }
        subtitle={u.sub}
      />

      <Card className="!p-6 sm:!p-8">
        <ProgressBar value={progress} label={`${u.stepWord} ${idx + 1} of ${stepsT.length}`} />
        <div className="mt-6 grid sm:grid-cols-[120px_1fr] gap-6 items-start">
          <motion.div
            key={step.id + '-icon'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-600 to-accent-pink flex items-center justify-center shadow-glow mx-auto sm:mx-0"
          >
            <Icon size={42} className="text-white" />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">{step.title}</h2>
              <p className="mt-3 text-slate-300 leading-relaxed">{step.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={prev} disabled={idx === 0} className="btn-ghost">
            <ArrowLeft size={16} /> {u.prev}
          </button>
          <div className="flex items-center gap-2">
            {idx === stepsT.length - 1 ? (
              <button type="button" onClick={reset} className="btn-primary">
                <RotateCcw size={16} /> {u.restart}
              </button>
            ) : (
              <button type="button" onClick={next} className="btn-primary">
                {step.cta} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 grid sm:grid-cols-5 gap-2">
        {stepsT.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIdx(i)}
            className={`text-left p-3 rounded-2xl border transition ${
              i === idx
                ? 'bg-gradient-to-br from-brand-600/30 to-accent-pink/20 border-brand-400/50 text-white'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
            aria-current={i === idx ? 'step' : undefined}
          >
            <span className="text-xs">
              {u.stepWord} {i + 1}
            </span>
            <p className="text-sm font-medium">{s.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
