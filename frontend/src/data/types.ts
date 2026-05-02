export type UserRole =
  | 'first_time_voter'
  | 'existing_voter'
  | 'student'
  | 'election_officer'
  | 'candidate'
  | 'admin';

export type LearningStage = 'discover' | 'learn' | 'practice' | 'mastery';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr';

export interface AccessibilityPreferences {
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  highContrast: boolean;
  dyslexiaFont: boolean;
  voiceInput: boolean;
}

export interface UserContext {
  role: UserRole;
  language: Language;
  accessibilityPreferences: AccessibilityPreferences;
  learningStage: LearningStage;
  checklistProgress: number;
  quizScore: number;
  chatHistorySummary: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language: Language;
  learningStage: LearningStage;
  checklistProgress: number;
  quizScore: number;
  accessibility: AccessibilityPreferences;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  intent?: string;
  confidence?: number;
  safetyStatus?: 'safe' | 'refused' | 'flagged';
  nextStep?: { label: string; route: string; cta: string };
  references?: string[];
  timestamp: number;
}

export interface TimelineStep {
  _id?: string;
  order: number;
  key: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  durationDays: number;
  icon: string;
  color: string;
  resources?: { label: string; url: string }[];
}

export interface FAQ {
  _id?: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  views: number;
  isActive: boolean;
}

export interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Present on API/seed questions; translated in the quiz review UI when set. */
  explanation?: string;
}

export interface QuizSubmissionResult {
  total: number;
  correct: number;
  score: number;
  passed: boolean;
  certificateId?: string;
  result: {
    questionId: string;
    correct: boolean;
    correctIndex?: number;
    explanation?: string;
  }[];
}
