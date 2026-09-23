import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import type { Locale } from '../i18n';

export type BlogPost = CollectionEntry<'blog'>;

export const localeForPost = (post: BlogPost): Locale => post.id.startsWith('ru/') ? 'ru' : 'es';
export const slugForPost = (post: BlogPost) => post.id.replace(/^ru\//, '').replace(/\.md$/, '');

export const sortPostsNewestFirst = (posts: BlogPost[]) => [...posts].sort((a, b) =>
  b.data.publishDate.valueOf() - a.data.publishDate.valueOf() || a.id.localeCompare(b.id),
);

export const getPublishedPosts = async (locale: Locale = 'es') => sortPostsNewestFirst(
  await getCollection('blog', (post) => !post.data.draft && localeForPost(post) === locale),
);

export const findTranslation = async (post: BlogPost, targetLocale: Locale) => {
  if (!post.data.translationSlug) return undefined;
  return (await getPublishedPosts(targetLocale)).find((candidate) => slugForPost(candidate) === post.data.translationSlug);
};
