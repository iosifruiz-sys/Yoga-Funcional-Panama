import type { APIRoute } from 'astro';
import { getPublishedPosts, slugForPost } from '../lib/blog';

export const prerender = true;

const xmlEntities: Record<string, string> = {
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
};
const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => xmlEntities[character]);
type SitemapEntry = { url: URL; lastmod?: Date };

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Astro site URL is required to generate sitemap.xml');

  const base = import.meta.env.BASE_URL;
  const posts = await getPublishedPosts();
  const urls: SitemapEntry[] = [
    { url: new URL(base, site) },
    { url: new URL(`${base}blog/`, site) },
    ...posts.map((post) => ({
      url: new URL(`${base}blog/${slugForPost(post)}/`, site),
      lastmod: post.data.updatedDate ?? post.data.publishDate,
    })),
  ];
  const entries = urls.map(({ url, lastmod }) => `  <url><loc>${escapeXml(url.href)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ''}</url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
