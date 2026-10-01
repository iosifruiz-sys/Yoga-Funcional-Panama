export const BLOG_TAG_IDS = [
  'yoga',
  'movement',
  'meditation',
  'body',
  'attention',
  'breathing',
  'science',
  'strength',
  'mobility',
  'philosophy',
  'buddhism',
  'recovery',
] as const;

export type BlogTagId = (typeof BLOG_TAG_IDS)[number];

export const FEATURED_BLOG_TAGS = [
  'yoga',
  'movement',
  'meditation',
  'body',
  'attention',
] as const satisfies readonly BlogTagId[];
