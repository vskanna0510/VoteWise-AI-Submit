import { useEffect, useState } from 'react';
import type { ChecklistItem } from '../data/checklist';
import type { QuizQuestion, TimelineStep, Language } from '../data/types';
import type { MythFact } from '../data/myths';
import type { EvaluationCriterion } from '../data/evaluationMatrix';
import { translateBatch } from '../services/translate';
export function useTranslatedTimeline(steps: TimelineStep[], language: Language): TimelineStep[] {
  const [display, setDisplay] = useState(steps);

  useEffect(() => {
    setDisplay(steps);
    if (language === 'en' || steps.length === 0) return;

    const flat: string[] = [];
    steps.forEach((s) => {
      flat.push(s.title, s.shortDescription, s.longDescription);
      s.resources?.forEach((r) => flat.push(r.label));
    });

    let cancelled = false;
    translateBatch(flat, language)
      .then((tr) => {
        if (cancelled || tr.length !== flat.length) return;
        let i = 0;
        setDisplay(
          steps.map((s) => {
            const next: TimelineStep = {
              ...s,
              title: tr[i++]!,
              shortDescription: tr[i++]!,
              longDescription: tr[i++]!,
            };
            if (s.resources?.length) {
              next.resources = s.resources.map((r) => ({ ...r, label: tr[i++]! }));
            }
            return next;
          }),
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [steps, language]);

  return display;
}

export function useTranslatedQuiz(questions: QuizQuestion[], language: Language): QuizQuestion[] {
  const [display, setDisplay] = useState(questions);

  useEffect(() => {
    setDisplay(questions);
    if (language === 'en' || questions.length === 0) return;

    const flat: string[] = [];
    questions.forEach((q) => {
      flat.push(q.question, ...q.options);
      if (q.explanation) flat.push(q.explanation);
    });

    let cancelled = false;
    translateBatch(flat, language)
      .then((tr) => {
        if (cancelled || tr.length !== flat.length) return;
        let k = 0;
        setDisplay(
          questions.map((q) => {
            const question = tr[k++]!;
            const options = q.options.map(() => tr[k++]!);
            const explanation = q.explanation ? tr[k++]! : undefined;
            return { ...q, question, options, explanation };
          }),
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [questions, language]);

  return display;
}

export function useTranslatedChecklist(items: ChecklistItem[], language: Language): ChecklistItem[] {
  const [display, setDisplay] = useState(items);

  useEffect(() => {
    setDisplay(items);
    if (language === 'en' || items.length === 0) return;
    const flat = items.flatMap((it) => [it.title, it.description, it.reminderTitle]);
    let cancelled = false;
    translateBatch(flat, language)
      .then((tr) => {
        if (cancelled || tr.length !== flat.length) return;
        setDisplay(
          items.map((it, i) => ({
            ...it,
            title: tr[i * 3]!,
            description: tr[i * 3 + 1]!,
            reminderTitle: tr[i * 3 + 2]!,
          })),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [items, language]);

  return display;
}

export function useTranslatedMyths(myths: MythFact[], language: Language): MythFact[] {
  const [display, setDisplay] = useState(myths);

  useEffect(() => {
    setDisplay(myths);
    if (language === 'en' || myths.length === 0) return;
    const flat = myths.flatMap((m) => [m.myth, m.fact, m.source]);

    let cancelled = false;
    translateBatch(flat, language)
      .then((tr) => {
        if (cancelled || tr.length !== flat.length) return;
        setDisplay(
          myths.map((m, i) => ({
            ...m,
            myth: tr[i * 3]!,
            fact: tr[i * 3 + 1]!,
            source: tr[i * 3 + 2]!,
          })),
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [myths, language]);

  return display;
}

export function useTranslatedEvaluation(
  matrix: EvaluationCriterion[],
  language: Language,
): EvaluationCriterion[] {
  const [display, setDisplay] = useState(matrix);

  useEffect(() => {
    setDisplay(matrix);
    if (language === 'en' || matrix.length === 0) return;

    const flat: string[] = [];
    matrix.forEach((c) => {
      flat.push(c.label, c.description, ...c.evidence);
    });

    let cancelled = false;
    translateBatch(flat, language)
      .then((tr) => {
        if (cancelled || tr.length !== flat.length) return;
        let k = 0;
        setDisplay(
          matrix.map((c) => ({
            ...c,
            label: tr[k++]!,
            description: tr[k++]!,
            evidence: c.evidence.map(() => tr[k++]!),
          })),
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [matrix, language]);

  return display;
}
