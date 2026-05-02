import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Download, RotateCcw, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { fetchQuiz, submitQuiz } from '../services/quiz';
import type { QuizQuestion, QuizSubmissionResult } from '../data/types';
import { useUserContext } from '../hooks/useUserContext';
import { useKeyedStrings } from '../hooks/useLocalizedTexts';
import { useTranslatedQuiz } from '../hooks/useTranslatedEntities';

const QZ: Record<string, string> = {
  loading: 'Loading quiz…',
  noQuestions: 'No questions found.',
  eyebrowQuiz: 'VoteWise Quiz',
  quizTitleLead: 'Test your ',
  quizTitleGlow: 'election IQ',
  quizSubtitle:
    '10 quick questions. Score 70% or above to earn a downloadable VoteWise certificate.',
  answered: 'Answered',
  prev: 'Previous',
  next: 'Next',
  submitQuiz: 'Submit quiz',
  submitting: 'Submitting…',
  qWord: 'Question',
  qOf: 'of',
  eyebrowResult: 'Quiz Result',
  resultTitle: 'Your VoteWise score',
  resultCorrectMiddle: 'of',
  correctLabel: 'correct',
  passed: 'Passed 🎉',
  tryAgainPass: 'Try again to pass (≥70%)',
  tryAgainBtn: 'Try again',
  continueLearning: 'Continue learning',
  reviewHeading: 'Review',
  correctAnswer: 'Correct answer:',
};

const CERT_UI: Record<string, string> = {
  vwCert: 'VoteWise Certificate',
  certifyIntro: 'This is to certify that',
  certifyBodyPrefix: 'has successfully completed the',
  certifyQuizName: 'Election-Process Quiz',
  certifyBodySuffix: 'with a score of',
  issuedLbl: 'Issued:',
  idLbl: 'ID:',
  download: 'Download',
};

const CertificateBlock = ({
  certId,
  score,
  name,
}: {
  certId: string;
  score: number;
  name: string;
}) => {
  const c = useKeyedStrings(CERT_UI);
  const issued = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const downloadAsImage = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      `<!doctype html><html><head><title>${c.vwCert}</title></head><body style="margin:0;font-family:Inter,sans-serif;background:#0b0b1f;color:#fff;padding:40px;"><div style="border:6px solid;border-image:linear-gradient(135deg,#8b5cf6,#ec4899) 1;padding:48px;text-align:center;">
      <h1 style="font-size:42px;margin:0;background:linear-gradient(90deg,#a78bfa,#ec4899);-webkit-background-clip:text;color:transparent;">${c.vwCert}</h1>
      <p style="margin-top:24px;font-size:18px;">${c.certifyIntro}</p>
      <h2 style="font-size:32px;margin:8px 0 24px 0;">${name}</h2>
      <p>${c.certifyBodyPrefix} VoteWise AI ${c.certifyQuizName} ${c.certifyBodySuffix}</p>
      <h2 style="font-size:48px;margin:8px 0;color:#a78bfa">${score}%</h2>
      <p style="margin-top:32px;font-size:14px;opacity:.7;">${issued} · ${c.idLbl} <strong>${certId}</strong></p>
    </div></body></html>`
    );
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-8 rounded-3xl border border-brand-400/40 bg-gradient-to-br from-brand-700/20 via-accent-pink/10 to-accent-cyan/10 p-8 text-left max-w-xl mx-auto"
    >
      <p className="text-xs uppercase tracking-widest text-brand-300">{c.vwCert}</p>
      <p className="mt-3 text-slate-300">{c.certifyIntro}</p>
      <p className="text-2xl font-display font-bold text-white">{name}</p>
      <p className="text-slate-300 mt-2">
        {c.certifyBodyPrefix} <strong>{c.certifyQuizName}</strong> {c.certifyBodySuffix}
      </p>
      <p className="text-4xl font-display font-bold gradient-text mt-1">{score}%</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          <p>
            {c.issuedLbl} {issued}
          </p>
          <p>
            {c.idLbl} <span className="text-brand-200">{certId}</span>
          </p>
        </div>
        <button type="button" onClick={downloadAsImage} className="btn-primary">
          <Download size={14} /> {c.download}
        </button>
      </div>
    </motion.div>
  );
};

export const QuizPage = () => {
  const { user, setQuizScore, ctx } = useUserContext();
  const u = useKeyedStrings(QZ);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz()
      .then(setQuestions)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const dq = useTranslatedQuiz(questions, ctx.language);

  const q = dq[idx];
  const totalAnswered = Object.keys(answers).length;
  const progress = dq.length > 0 ? (totalAnswered / dq.length) * 100 : 0;

  const choose = (i: number) => {
    if (!q) return;
    setAnswers((p) => ({ ...p, [q._id]: i }));
  };

  const next = () => setIdx((i) => Math.min(i + 1, Math.max(dq.length - 1, 0)));
  const prev = () => setIdx((i) => Math.max(i - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex,
      }));
      const r = await submitQuiz(payload);
      setResult(r);
      setQuizScore(r.score);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setResult(null);
    setIdx(0);
  };

  if (loading) return <p className="text-slate-400 py-20 text-center">{u.loading}</p>;
  if (error && dq.length === 0 && !result)
    return (
      <p className="text-rose-400 py-20 text-center">
        ⚠️ {error}
      </p>
    );
  if (dq.length === 0) return <p className="text-slate-400 py-20 text-center">{u.noQuestions}</p>;

  if (result) {
    return (
      <div>
        <PageHeader eyebrow={u.eyebrowResult} title={<>{u.resultTitle}</>} />
        <Card glow className="text-center !p-10">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220 }}
            className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-accent-pink flex items-center justify-center mb-4 shadow-glow"
          >
            <Trophy size={42} className="text-white" />
          </motion.div>
          <p className="text-5xl font-display font-bold text-white">{result.score}%</p>
          <p className="mt-1 text-slate-300">
            {result.correct} {u.resultCorrectMiddle} {result.total} {u.correctLabel} ·{' '}
            {result.passed ? (
              <span className="text-emerald-300 font-semibold">{u.passed}</span>
            ) : (
              <span className="text-amber-300 font-semibold">{u.tryAgainPass}</span>
            )}
          </p>

          {result.passed && result.certificateId && (
            <CertificateBlock
              certId={result.certificateId}
              score={result.score}
              name={user?.name ?? 'Demo User'}
            />
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="btn-ghost">
              <RotateCcw size={16} /> {u.tryAgainBtn}
            </button>
            <a href="/timeline" className="btn-primary">
              {u.continueLearning} <ArrowRight size={16} />
            </a>
          </div>

          <div className="mt-10 text-left">
            <h3 className="font-display text-lg font-bold mb-3">{u.reviewHeading}</h3>
            <ul className="space-y-3">
              {result.result.map((rr, i) => {
                const orig = dq.find((qq) => qq._id === rr.questionId);
                return (
                  <li key={rr.questionId} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3">
                      {rr.correct ? (
                        <CheckCircle2 size={20} className="text-emerald-400 mt-0.5" />
                      ) : (
                        <XCircle size={20} className="text-rose-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {i + 1}. {orig?.question}
                        </p>
                        <p className="text-sm text-slate-300 mt-1">
                          <strong>{u.correctAnswer}</strong>{' '}
                          {orig?.options[rr.correctIndex ?? 0]}
                        </p>
                        {rr.explanation && (
                          <p className="text-xs text-slate-400 mt-1.5 italic">{rr.explanation}</p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={u.eyebrowQuiz}
        title={
          <>
            {u.quizTitleLead}
            <span className="gradient-text">{u.quizTitleGlow}</span>
          </>
        }
        subtitle={u.quizSubtitle}
      />

      <Card className="!p-6 sm:!p-8">
        <ProgressBar
          value={progress}
          label={`${u.answered} ${totalAnswered} / ${dq.length}`}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={q?._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="mt-6"
          >
            <p className="text-sm text-brand-300 font-medium">
              {u.qWord} {idx + 1} {u.qOf} {dq.length}
            </p>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-white">{q?.question}</h2>
            <ul className="mt-5 space-y-2">
              {q?.options.map((opt, i) => {
                const selected = answers[q._id] === i;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => choose(i)}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition flex items-center gap-3 ${
                        selected
                          ? 'bg-gradient-to-r from-brand-600/30 to-accent-pink/20 border-brand-400/60 text-white'
                          : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                          selected ? 'bg-gradient-to-br from-brand-500 to-accent-pink text-white' : 'bg-white/10'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button type="button" onClick={prev} disabled={idx === 0} className="btn-ghost">
            {u.prev}
          </button>
          {idx < dq.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={!q || answers[q._id] === undefined}
              className="btn-primary"
            >
              {u.next} <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || totalAnswered < dq.length}
              className="btn-primary"
            >
              <Trophy size={16} /> {submitting ? u.submitting : u.submitQuiz}
            </button>
          )}
        </div>
      </Card>
      {error && (
        <p className="text-rose-400 text-center mt-4 text-sm">{error}</p>
      )}
    </div>
  );
};
