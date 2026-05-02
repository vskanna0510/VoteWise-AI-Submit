import axios, { AxiosInstance } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
});

const TOKEN_KEY = 'votewise.token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string): void => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Lightweight in-memory GET cache (60s)
const cache = new Map<string, { ts: number; data: unknown }>();
const TTL = 60_000;

export const cachedGet = async <T,>(url: string): Promise<T> => {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.ts < TTL) return hit.data as T;
  const { data } = await api.get<T>(url);
  cache.set(url, { ts: Date.now(), data });
  return data;
};

export const invalidateCache = (prefix?: string): void => {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k);
};
