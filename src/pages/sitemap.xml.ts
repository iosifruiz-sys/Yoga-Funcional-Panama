import type { APIRoute } from 'astro';
import { getPublishedPosts, slugForPost } from '../lib/blog';
import { localizedPath, type Locale } from '../i18n';
export const prerender = true;
const escapeXml=(value:string)=>value.replace(/[<>&'\"]/g,(c)=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]!));
export const GET:APIRoute=async({site})=>{if(!site)throw new Error('Astro site URL is required to generate sitemap.xml'); const locales:Locale[]=['es','ru']; const entries=[];
for(const locale of locales){entries.push({url:new URL(localizedPath(locale),site)});entries.push({url:new URL(localizedPath(locale,'blog/'),site)});for(const post of await getPublishedPosts(locale))entries.push({url:new URL(localizedPath(locale,`blog/${slugForPost(post)}/`),site),lastmod:post.data.updatedDate??post.data.publishDate});}
const body=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(({url,lastmod}:{url:URL,lastmod?:Date})=>`  <url><loc>${escapeXml(url.href)}</loc>${lastmod?`<lastmod>${lastmod.toISOString()}</lastmod>`:''}</url>`).join('\n')}\n</urlset>`;return new Response(body,{headers:{'Content-Type':'application/xml; charset=utf-8'}})};
