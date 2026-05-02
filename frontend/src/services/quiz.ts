import { api, cachedGet } from './api';
import type { QuizQuestion, QuizSubmissionResult } from '../data/types';

export const fetchQuiz = async (): Promise<QuizQuestion[]> => {
  const data = await cachedGet<{ success: true; questions: QuizQuestion[] }>('/quiz');
  return data.questions;
};

export const submitQuiz = async (
  answers: { questionId: string; selectedIndex: number }[]
): Promise<QuizSubmissionResult> => {
  const { data } = await api.post<{ success: true } & QuizSubmissionResult>('/quiz/submit', { answers });
  return data;
};
