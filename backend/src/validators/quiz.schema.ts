import { z } from 'zod';

export const quizSubmitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedIndex: z.number().int().min(0).max(10),
      })
    )
    .min(1)
    .max(50),
});

export type QuizSubmitInput = z.infer<typeof quizSubmitSchema>;
