import { getCollection } from 'astro:content';
import { publicFile, reachable } from './resourceAssets.mjs';
import { getPublishedPosts, localeForPost, slugForPost } from './blog';
import { localizedPath } from '../i18n';
import type { ResourceData } from './resourceSchema';

export interface PracticeResource {
  id: string;
  title: string;
  description: string;
  type: ResourceData['type'];
  href: string;
  download: boolean;
  image?: string;
  imageAlt?: string;
  article?: string;
}

export async function getPracticeResources(language: ResourceData['language'] = 'es'): Promise<PracticeResource[]> {
  const entries = (await getCollection('resources')).filter(({ id, data }) =>
    data.language === language && id.startsWith(`${language}/`) && !data.draft && data.approved,
  ).sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
  const posts = language === 'en' ? [] : await getPublishedPosts(language);
  const output: PracticeResource[] = [];
  for (const { id, data } of entries) {
    if (!data.description.trim() || Boolean(data.file) === Boolean(data.url)) continue;
    let href = '';
    if (data.file) {
      const bytes = await publicFile(data.file, '/resources/');
      if (!bytes?.length || (data.type === 'pdf' && (!data.file.toLowerCase().endsWith('.pdf') || bytes.subarray(0, 5).toString() !== '%PDF-'))) continue;
      href = `${import.meta.env.BASE_URL}${data.file.slice(1)}`;
    } else {
      if (!await reachable(data.url)) {
        console.warn(`[resources] Hidden ${id}: destination unavailable.`);
        continue;
      }
      href = data.url;
    }
    const image = data.image && data.imageAlt.trim() && await publicFile(data.image, '/resources/') ? `${import.meta.env.BASE_URL}${data.image.slice(1)}` : undefined;
    const post = posts.find((post) => slugForPost(post) === data.relatedArticle);
    output.push({
      id, title: data.title, description: data.description, type: data.type, href,
      download: Boolean(data.file), image, imageAlt: image ? data.imageAlt : undefined,
      article: post ? localizedPath(localeForPost(post), `blog/${slugForPost(post)}/`) : undefined,
    });
  }
  return output;
}
