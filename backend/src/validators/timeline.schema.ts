import { z } from 'zod';

export const timelineSchema = z.object({
  order: z.number().int().min(1).max(100),
  key: z.string().min(2).max(50).toLowerCase(),
  title: z.string().min(2).max(120),
  shortDescription: z.string().min(5).max(240),
  longDescription: z.string().min(10).max(4000),
  durationDays: z.number().int().min(0).max(365).default(1),
  icon: z.string().max(40).default('Calendar'),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/).default('#8b5cf6'),
  resources: z
    .array(z.object({ label: z.string(), url: z.string().url() }))
    .max(10)
    .optional()
    .default([]),
  isActive: z.boolean().default(true),
});

export type TimelineInput = z.infer<typeof timelineSchema>;
