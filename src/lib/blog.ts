import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export const slugForPost = (post: BlogPost) => post.id.replace(/\.md$/, '');

export const sortPostsNewestFirst = (posts: BlogPost[]) => [...posts].sort((a, b) =>
  b.data.publishDate.valueOf() - a.data.publishDate.valueOf() || a.id.localeCompare(b.id),
);

export const getPublishedPosts = async () => sortPostsNewestFirst(
  await getCollection('blog', ({ data }) => !data.draft),
);
