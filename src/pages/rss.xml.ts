import rss from '@astrojs/rss';
import { getPublishedPosts, slugForPost } from '../lib/blog';

export async function GET(context: { site: URL | undefined }) {
  if (!context.site) throw new Error('Astro site URL is required to generate rss.xml');

  const base = import.meta.env.BASE_URL;
  const posts = await getPublishedPosts();

  return rss({
    title: 'Blog | Yoga Funcional Panamá',
    description: 'Artículos sobre Yoga Funcional, fuerza, movilidad, respiración, atención, recuperación y meditación.',
    site: new URL(base, context.site),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `${base}blog/${slugForPost(post)}/`,
      categories: [...(post.data.category ? [post.data.category] : []), ...post.data.tags],
    })),
  });
}
