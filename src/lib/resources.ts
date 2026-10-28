import { getCollection } from 'astro:content';
import { publicFile, checkResourceUrl } from './resourceAssets.mjs';
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
  previewPages?: string[];
  article?: string;
}

async function loadPracticeResources(language: ResourceData['language']): Promise<PracticeResource[]> {
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
      const status = await checkResourceUrl(data.url);
      if (status === 'unavailable') {
        console.warn(`[resources] Hidden ${id}: destination unavailable.`);
        continue;
      }
      if (status === 'temporary') console.warn(`[resources] ${id}: URL check temporarily inconclusive after retries; retaining the destination explicitly approved in CMS.`);
      href = data.url;
    }
    const image = data.image && data.imageAlt.trim() && await publicFile(data.image, '/resources/') ? `${import.meta.env.BASE_URL}${data.image.slice(1)}` : undefined;
    // The prebuild step renders these from the original PDF. If previews are
    // unavailable (e.g. a dev machine without Poppler), use the CMS cover.
    const previewPages: string[] = [];
    if (data.type === 'pdf' && data.file && /^\/resources\/[-a-z0-9_]+\.pdf$/i.test(data.file)) {
      const base = data.file.slice('/resources/'.length).replace(/\.pdf$/i, '');
      for (let i = 1; i <= 4; i++) {
        const filename = `/resources/previews/${base}-page-${String(i).padStart(2, '0')}.png`;
        if (!await publicFile(filename, '/resources/previews/')) break;
        previewPages.push(`${import.meta.env.BASE_URL}${filename.slice(1)}`);
      }
    }
    const post = posts.find((post) => slugForPost(post) === data.relatedArticle);
    output.push({
      id, title: data.title, description: data.description, type: data.type, href,
      download: Boolean(data.file), image, imageAlt: image ? data.imageAlt : undefined, previewPages,
      article: post ? localizedPath(localeForPost(post), `blog/${slugForPost(post)}/`) : undefined,
    });
  }
  return output;
}

// One publication decision per language/build, shared by navigation, route and sitemap.
// Dev mode stays live for Decap/local content changes.
const builds = new Map<ResourceData['language'], Promise<PracticeResource[]>>();
export function getPracticeResources(language: ResourceData['language'] = 'es'): Promise<PracticeResource[]> {
  if (import.meta.env.DEV) return loadPracticeResources(language);
  if (!builds.has(language)) builds.set(language, loadPracticeResources(language));
  return builds.get(language)!;
}
