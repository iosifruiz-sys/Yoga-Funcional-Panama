import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

const slugFor = (id: string) => id.replace(/\.md$/, '');

export async function GET(context: { site: URL | undefined }) {
  if (!context.site) throw new Error('Astro site URL is required to generate rss.xml');

  const base = import.meta.env.BASE_URL;
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  return rss({
    title: 'Blog | Yoga Funcional Panamá',
    description: 'Artículos sobre Yoga Funcional, fuerza, movilidad, respiración, atención, recuperación y meditación.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `${base}blog/${slugFor(post.id)}/`,
      categories: [...(post.data.category ? [post.data.category] : []), ...post.data.tags],
    })),
  });
}
