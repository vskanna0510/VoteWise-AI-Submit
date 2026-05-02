import { z } from 'zod';
import { USER_ROLES, SUPPORTED_LANGUAGES } from '../config/constants';

export const chatSchema = z.object({
  prompt: z.string().min(1).max(2000),
  sessionId: z.string().min(4).max(100),
  context: z
    .object({
      role: z.enum(USER_ROLES).optional(),
      language: z.enum(SUPPORTED_LANGUAGES).optional(),
      learningStage: z.enum(['discover', 'learn', 'practice', 'mastery']).optional(),
      checklistProgress: z.number().min(0).max(100).optional(),
      quizScore: z.number().min(0).optional(),
      chatHistorySummary: z.string().max(2000).optional(),
    })
    .optional(),
});

export type ChatInput = z.infer<typeof chatSchema>;
