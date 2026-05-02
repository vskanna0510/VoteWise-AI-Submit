import { api, cachedGet, invalidateCache } from './api';
import type { TimelineStep } from '../data/types';

export const fetchTimeline = async (): Promise<TimelineStep[]> => {
  const data = await cachedGet<{ success: true; steps: TimelineStep[] }>('/timeline');
  return data.steps;
};

export const upsertStep = async (input: Partial<TimelineStep> & { _id?: string }): Promise<TimelineStep> => {
  const { _id, ...body } = input;
  const { data } = _id
    ? await api.put<{ success: true; step: TimelineStep }>(`/timeline/${_id}`, body)
    : await api.post<{ success: true; step: TimelineStep }>('/timeline', body);
  invalidateCache('/timeline');
  return data.step;
};
