export const USER_ROLES = [
  'first_time_voter',
  'existing_voter',
  'student',
  'election_officer',
  'candidate',
  'admin',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const LEARNING_STAGES = [
  'discover',
  'learn',
  'practice',
  'mastery',
] as const;

export type LearningStage = (typeof LEARNING_STAGES)[number];

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'ta', 'te', 'bn', 'mr'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
