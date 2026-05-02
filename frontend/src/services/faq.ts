import { api, cachedGet, invalidateCache } from './api';
import type { FAQ } from '../data/types';

export const fetchFaqs = async (q?: string): Promise<FAQ[]> => {
  const url = q ? `/faqs?q=${encodeURIComponent(q)}` : '/faqs';
  const data = await cachedGet<{ success: true; faqs: FAQ[] }>(url);
  return data.faqs;
};

export const createFaq = async (input: Omit<FAQ, '_id' | 'views'>): Promise<FAQ> => {
  const { data } = await api.post<{ success: true; faq: FAQ }>('/faqs', input);
  invalidateCache('/faqs');
  return data.faq;
};

export const updateFaq = async (id: string, input: Partial<FAQ>): Promise<FAQ> => {
  const { data } = await api.put<{ success: true; faq: FAQ }>(`/faqs/${id}`, input);
  invalidateCache('/faqs');
  return data.faq;
};

export const deleteFaq = async (id: string): Promise<void> => {
  await api.delete(`/faqs/${id}`);
  invalidateCache('/faqs');
};
