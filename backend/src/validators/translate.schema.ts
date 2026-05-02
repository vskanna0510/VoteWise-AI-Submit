import { z } from 'zod';

export const translateBodySchema = z.object({
  texts: z.array(z.string().min(1).max(5000)).min(1).max(100),
  target: z.enum(['hi', 'ta', 'te', 'bn', 'mr']),
  source: z.enum(['en']).optional().default('en'),
});
