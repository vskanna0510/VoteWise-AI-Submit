import { api } from './api';

export interface AdminAnalytics {
  totalUsers: number;
  totalChats: number;
  refusedChats: number;
  refusalRate: number;
  intentDistribution: { _id: string; count: number }[];
  roleDistribution: { _id: string; count: number }[];
  totalFaqViews: number;
}

export const fetchAnalytics = async (): Promise<AdminAnalytics> => {
  const { data } = await api.get<{ success: true; analytics: AdminAnalytics }>('/admin/analytics');
  return data.analytics;
};
