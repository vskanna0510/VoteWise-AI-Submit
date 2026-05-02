import { z } from 'zod';

export const faqSchema = z.object({
  question: z.string().min(5).max(300),
  answer: z.string().min(5).max(4000),
  category: z.enum(['registration', 'voting', 'eligibility', 'process', 'general']).default('general'),
  tags: z.array(z.string().min(1).max(40)).max(10).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export type FAQInput = z.infer<typeof faqSchema>;
