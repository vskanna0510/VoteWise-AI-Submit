import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import type {
  AccessibilityPreferences,
  AuthUser,
  Language,
  LearningStage,
  UserContext,
  UserRole,
} from '../data/types';
import { meApi, loginApi, registerApi, logout as logoutApi } from '../services/auth';
import { getToken } from '../services/api';

const DEFAULT_ACCESSIBILITY: AccessibilityPreferences = {
  fontSize: 'md',
  highContrast: false,
  dyslexiaFont: false,
  voiceInput: false,
};

const STORAGE_KEY = 'votewise.userContext';

interface ContextValue {
  user: AuthUser | null;
  ctx: UserContext;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  logout: () => void;
  setRole: (r: UserRole) => void;
  setLanguage: (l: Language) => void;
  setLearningStage: (s: LearningStage) => void;
  setChecklistProgress: (n: number) => void;
  setQuizScore: (n: number) => void;
  setAccessibility: (p: Partial<AccessibilityPreferences>) => void;
  appendChatSummary: (line: string) => void;
}

const Ctx = createContext<ContextValue | null>(null);

const loadFromStorage = (): Partial<UserContext> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<UserContext>;
  } catch {
    return {};
  }
};

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const cached = loadFromStorage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(getToken()));

  const [role, setRoleState] = useState<UserRole>(cached.role ?? 'first_time_voter');
  const [language, setLanguageState] = useState<Language>(cached.language ?? 'en');
  const [learningStage, setLearningStageState] = useState<LearningStage>(cached.learningStage ?? 'discover');
  const [checklistProgress, setChecklistProgressState] = useState<number>(cached.checklistProgress ?? 0);
  const [quizScore, setQuizScoreState] = useState<number>(cached.quizScore ?? 0);
  const [accessibility, setAccessibilityState] = useState<AccessibilityPreferences>(
    cached.accessibilityPreferences ?? DEFAULT_ACCESSIBILITY
  );
  const [chatHistorySummary, setChatHistorySummary] = useState<string>(cached.chatHistorySummary ?? '');

  // Persist to localStorage
  useEffect(() => {
    const payload: UserContext = {
      role,
      language,
      learningStage,
      checklistProgress,
      quizScore,
      accessibilityPreferences: accessibility,
      chatHistorySummary,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [role, language, learningStage, checklistProgress, quizScore, accessibility, chatHistorySummary]);

  // Hydrate from /auth/me if token exists
  useEffect(() => {
    let mounted = true;
    if (getToken()) {
      meApi()
        .then((u) => {
          if (!mounted) return;
          setUser(u);
          setRoleState(u.role);
          setLanguageState(u.language);
          setLearningStageState(u.learningStage);
          setChecklistProgressState(u.checklistProgress);
          setQuizScoreState(u.quizScore);
          setAccessibilityState(u.accessibility ?? DEFAULT_ACCESSIBILITY);
        })
        .catch(() => {
          logoutApi();
          setUser(null);
        })
        .finally(() => mounted && setLoading(false));
    }
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await loginApi(email, password);
    setUser(u);
    setRoleState(u.role);
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string; role: UserRole }) => {
      const u = await registerApi({ ...input, language });
      setUser(u);
      setRoleState(u.role);
    },
    [language]
  );

  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
  }, []);

  const setAccessibility = useCallback((p: Partial<AccessibilityPreferences>) => {
    setAccessibilityState((prev) => ({ ...prev, ...p }));
  }, []);

  const appendChatSummary = useCallback((line: string) => {
    setChatHistorySummary((prev) => {
      const next = prev ? `${prev}\n${line}` : line;
      return next.length > 1500 ? next.slice(-1500) : next;
    });
  }, []);

  const value = useMemo<ContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      ctx: {
        role,
        language,
        learningStage,
        checklistProgress,
        quizScore,
        accessibilityPreferences: accessibility,
        chatHistorySummary,
      },
      login,
      register,
      logout,
      setRole: setRoleState,
      setLanguage: setLanguageState,
      setLearningStage: setLearningStageState,
      setChecklistProgress: setChecklistProgressState,
      setQuizScore: setQuizScoreState,
      setAccessibility,
      appendChatSummary,
    }),
    [
      user,
      loading,
      role,
      language,
      learningStage,
      checklistProgress,
      quizScore,
      accessibility,
      chatHistorySummary,
      login,
      register,
      logout,
      setAccessibility,
      appendChatSummary,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useUserContext = (): ContextValue => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUserContext must be used inside UserContextProvider');
  return v;
};
