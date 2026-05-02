import { api, setToken, clearToken } from './api';
import type { AuthUser, UserRole, Language } from '../data/types';

interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export const registerApi = async (input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  language?: Language;
}): Promise<AuthUser> => {
  const { data } = await api.post<AuthResponse>('/auth/register', input);
  setToken(data.token);
  return data.user;
};

export const loginApi = async (email: string, password: string): Promise<AuthUser> => {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  setToken(data.token);
  return data.user;
};

export const meApi = async (): Promise<AuthUser> => {
  const { data } = await api.get<{ success: true; user: AuthUser }>('/auth/me');
  return data.user;
};

export const logout = (): void => clearToken();
