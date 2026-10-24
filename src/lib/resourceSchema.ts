import { z } from 'astro:content';

// Decap may omit optional fields or serialize cleared values as null.
const optionalText = z.preprocess((value) => value == null ? '' : value, z.string()).default('');
// Drafts may be incomplete. Publication eligibility is checked in resources.ts.
export const resourceSchema = z.object({
  title: z.string().min(1),
  language: z.enum(['es', 'ru', 'en']),
  type: z.enum(['pdf', 'video', 'audio', 'questionnaire', 'test']),
  order: z.number().int().nonnegative().default(0),
  draft: z.boolean().default(true),
  approved: z.boolean().default(false),
  description: optionalText,
  file: optionalText,
  url: optionalText,
  image: optionalText,
  imageAlt: optionalText,
  relatedArticle: optionalText,
});

export type ResourceData = z.infer<typeof resourceSchema>;
