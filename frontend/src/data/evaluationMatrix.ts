export interface EvaluationCriterion {
  id: string;
  label: string;
  description: string;
  score: number; // out of 10
  evidence: string[];
}

export const EVALUATION_MATRIX: EvaluationCriterion[] = [
  {
    id: 'code-quality',
    label: 'Code Quality',
    description: 'TypeScript end-to-end, modular folder structure, separation of concerns.',
    score: 9.5,
    evidence: [
      'Strict TS in both apps',
      'Controllers / Services / Models split',
      'Zod-validated request bodies',
    ],
  },
  {
    id: 'security',
    label: 'Security',
    description: 'JWT auth, bcrypt, helmet, CORS, rate limits, neutrality guardrails.',
    score: 9.0,
    evidence: ['JWT (HS256, 7d)', 'bcrypt 12 rounds', 'Helmet + CORS', '3-tier rate limits'],
  },
  {
    id: 'efficiency',
    label: 'Efficiency',
    description: 'Vite chunking, lazy routes, MongoDB indexes, response caching.',
    score: 8.8,
    evidence: ['React.lazy on every page', 'Mongoose indexes on hot fields', 'Manual chunks'],
  },
  {
    id: 'testing',
    label: 'Testing',
    description: 'Vitest unit & API tests, manual smoke checklist in README.',
    score: 8.0,
    evidence: ['DecisionEngine unit tests', 'Health endpoint test', '10-step manual checklist'],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'ARIA, keyboard nav, contrast modes, dyslexia font, font scaling.',
    score: 9.4,
    evidence: ['Skip link', 'Focus rings', 'Reduced-motion respect', 'Contrast / dyslexia toggles'],
  },
  {
    id: 'google-services',
    label: 'Google Services',
    description: 'Firebase, Gemini, Translate, Maps, Calendar, Analytics, Cloud Run.',
    score: 9.0,
    evidence: ['7 services scaffolded', 'Drop-in env keys', 'UI integration in pages'],
  },
  {
    id: 'smart-assistant',
    label: 'Smart Assistant',
    description: 'Context-aware role + stage personalisation, suggested prompts.',
    score: 9.6,
    evidence: ['Role-based responses', 'Checklist-aware suffixes', 'Refusal system'],
  },
  {
    id: 'decision-making',
    label: 'Decision Engine',
    description: 'Intent + role mapping, structured output, confidence scoring.',
    score: 9.3,
    evidence: ['14 intents', '6 roles', 'next-step routing'],
  },
  {
    id: 'usability',
    label: 'Usability',
    description: 'Premium UI, smooth transitions, mobile-first, clear hierarchy.',
    score: 9.5,
    evidence: ['Glassmorphism dark theme', 'Framer Motion animations', 'Mobile drawer nav'],
  },
];
