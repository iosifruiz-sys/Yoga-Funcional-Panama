// Local-only integration review. Temporary routes/content are removed in finally.
// No fixture is an approved resource, and no fixture enters the production build.
import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, unlink, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = process.env.RESOURCES_REVIEW_OUTPUT;
if (!output) throw new Error('Set RESOURCES_REVIEW_OUTPUT to an absolute artifact directory.');
await mkdir(output, { recursive: true });
const temporary = [];
const serverUrl = 'http://127.0.0.1:4331';
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
async function temporaryFile(path, text) {
  try { await access(path); throw new Error(`Refusing to overwrite ${path}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(resolve(path, '..'), { recursive: true });
  await writeFile(path, text);
  temporary.push(path);
}
let browser;
let server;
let log = '';
const errors = [];
try {
  await temporaryFile('src/pages/resources-review-local.astro', `---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import PracticeIndex from '../components/PracticeIndex.astro';
import {getPracticeResources} from '../lib/resources';
const types = ['pdf','video','audio','questionnaire','test'] as const;
const fixtures = types.map((type, index) => ({id:type, type, title:'DEMO · '+type.toUpperCase(), description:'Registro sintético para comprobar la interfaz. No es un recurso publicado.', href:'/blog/que-es-yoga-funcional/', download:false, article:index === 0 ? '/blog/que-es-yoga-funcional/' : undefined, image:index === 1 ? '/images/funcyo.png' : undefined, imageAlt:index === 1 ? 'Marca Yoga Funcional (prueba local)' : undefined}));
const eligible = {es:await getPracticeResources('es'),ru:await getPracticeResources('ru'),en:await getPracticeResources('en')};
---
<BaseLayout title="DEMO LOCAL — Recursos" description="Datos sintéticos de prueba" locale="es">
<Header locale="es" />
<p style="margin:0;padding:1rem;background:#ff6500;color:#171714;font-weight:bold">DEMO LOCAL · DATOS DE PRUEBA · NO PUBLICAR</p>
<main id="contenido"><PracticeIndex resources={fixtures} /></main><Footer locale="es" />
<style is:global>astro-dev-toolbar { display:none; }</style>
<script id="review-eligible" type="application/json" set:html={JSON.stringify(eligible)} />
</BaseLayout>`);
  server = spawn(process.execPath, ['node_modules/astro/astro.js', 'dev', '--host', '127.0.0.1', '--port', '4331'], { cwd: process.cwd(), windowsHide: true, stdio: ['ignore','pipe','pipe'] });
  for (const stream of [server.stdout, server.stderr]) stream.on('data', (chunk) => { log = (log + chunk).slice(-14000); });
  for (let i = 0; i < 90; i++) {
    try { if ((await fetch(serverUrl + '/recursos/')).ok) break; } catch {}
    if (i === 89) throw Error('Dev server did not start: ' + log);
    await pause(500);
  }
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const page = await browser.newPage({ viewport: { width:1440, height:1000 } });
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [320,390,768,992,1440]) {
    await page.setViewportSize({ width, height:width < 992 ? 844 : 1000 });
    await page.goto(serverUrl + '/recursos/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.practice-row')).toHaveCount(0);
    await expect(page.getByText('¿Qué tan móvil eres?', {exact:true})).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://iosifruiz.com/recursos/');
    if ([390,1440].includes(width)) {
      await page.addStyleTag({content:'astro-dev-toolbar {display:none}'});
      await page.screenshot({path:resolve(output,`resources-public-${width}.png`),fullPage:true});
    }
  }
  for (const width of [390,1440]) {
    await page.setViewportSize({ width, height:900 });
    for (const path of ['/','/ru/','/blog/','/ru/blog/']) {
      expect((await page.goto(serverUrl+path)).status()).toBe(200);
      const ru = path.startsWith('/ru/');
      await expect(page.locator('.site-header nav a[href="/ru/recursos/"]')).toHaveCount(0);
      if (width < 992) await page.locator('.menu-toggle').click();
      if (!ru) {
        const link = page.locator('.site-header nav a[href="/recursos/"]');
        await link.click();
        await expect(page).toHaveURL(serverUrl+'/recursos/');
      }
      if (width < 992 && ru) await page.keyboard.press('Escape');
      await page.evaluate(() => scrollTo(0,300));
      expect(await page.locator('.site-header').evaluate(x=>x.getBoundingClientRect().top)).toBe(0);
    }
  }
  // Independent locales and fail-closed publication rules, without real PDF content.
  await temporaryFile('public/resources/__review-target.txt','LOCAL TEST FIXTURE — NOT A RESOURCE');
  const common = {title:'LOCAL TEST',language:'es',type:'test',order:99,draft:false,approved:true,description:'LOCAL TEST FIXTURE',file:'/resources/__review-target.txt',url:'',image:'',imageAlt:'',relatedArticle:''};
  const cases = {
    'valid':{relatedArticle:'que-es-yoga-funcional'},
    'draft':{draft:true}, 'unapproved':{approved:false}, 'missing':{file:'/resources/__missing.txt'},
    'blank':{description:''}, 'both':{url:'https://example.invalid/'},
    'invalid-url':{file:'',url:'http://example.invalid/'},
    'fake-pdf':{type:'pdf'}, 'traversal':{file:'/resources/../admin/config.yml'},
    'optional-missing':{image:'/resources/__missing.png',imageAlt:'TEST',relatedArticle:'not-published'},
  };
  for (const [name, overrides] of Object.entries(cases)) await temporaryFile(`src/content/resources/es/__review-${name}.json`,JSON.stringify({...common,...overrides}));
  await temporaryFile('src/content/resources/en/__review-independent.json',JSON.stringify({...common,language:'en'}));
  await temporaryFile('src/content/resources/ru/__review-draft.json',JSON.stringify({...common,language:'ru',draft:true}));
  await pause(1000);
  await page.goto(serverUrl+'/resources-review-local/');
  const eligible = JSON.parse(await page.locator('#review-eligible').textContent());
  expect(eligible.es.map(x=>x.id).sort()).toEqual(['es/__review-optional-missing','es/__review-valid']);
  expect(eligible.en.map(x=>x.id)).toEqual(['en/__review-independent']);
  expect(eligible.ru).toEqual([]);
  expect(eligible.es.find(x=>x.id.endsWith('-valid')).article).toBe('/blog/que-es-yoga-funcional/');
  expect(eligible.es.find(x=>x.id.endsWith('-missing')).article).toBeUndefined();
  expect(eligible.es.find(x=>x.id.endsWith('-missing')).image).toBeUndefined();
  console.log('PASS publication filters, independent locales, optional published blog relation');
  await page.close();

  const context = await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:output,size:{width:1440,height:1000}}});
  const desktop = await context.newPage();
  desktop.on('pageerror', (error) => errors.push(error.message));
  await desktop.goto(serverUrl+'/resources-review-local/');
  await desktop.evaluate(()=>document.fonts.ready);
  const rows = desktop.locator('.practice-row');
  const panel = desktop.locator('.practice-preview');
  await desktop.screenshot({path:resolve(output,'resources-demo-desktop-index.png'),fullPage:true});
  const before = await rows.evaluateAll(xs=>xs.map(x=>x.getBoundingClientRect().top));
  await rows.first().hover({position:{x:120,y:25}});
  await expect(panel).toBeVisible();
  await expect(desktop.locator('#practice-preview-title')).toHaveText('DEMO · PDF');
  await desktop.waitForTimeout(350);
  expect(await rows.evaluateAll(xs=>xs.map(x=>x.getBoundingClientRect().top))).toEqual(before);
  await desktop.locator('[data-preview-action]').hover();
  await desktop.waitForTimeout(500);
  await expect(panel).toBeVisible();
  await expect(desktop.locator('[data-preview-article]')).toBeVisible();
  await desktop.screenshot({path:resolve(output,'resources-demo-desktop-preview.png')});
  await desktop.mouse.move(30,200);
  await desktop.waitForTimeout(500);
  for (let i=1;i<5;i++) {
    await rows.nth(i).hover({position:{x:120,y:20}});
    await expect(desktop.locator('#practice-preview-title')).toHaveText('DEMO · '+['PDF','VIDEO','AUDIO','QUESTIONNAIRE','TEST'][i]);
    await desktop.waitForTimeout(500);
    await expect(desktop.locator('[data-preview-article]')).toBeHidden();
  }
  for (const index of [1,2,1,2]) await rows.nth(index).hover({position:{x:120,y:20}});
  await expect(desktop.locator('#practice-preview-title')).toHaveText('DEMO · AUDIO');
  await expect(desktop.locator('[data-preview-content]')).not.toHaveAttribute('data-changing','');
  await expect(desktop.locator('dialog[open]')).toHaveCount(1);
  await rows.first().focus();
  await desktop.keyboard.press('Enter');
  await expect(panel).toHaveAttribute('data-instant','');
  await desktop.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await expect(rows.first()).toBeFocused();
  await expect(desktop.locator('video,audio,iframe,embed')).toHaveCount(0);
  await desktop.emulateMedia({reducedMotion:'reduce'});
  await rows.nth(1).hover({position:{x:120,y:20}});
  await expect(panel).toBeVisible();
  expect(await panel.evaluate(x=>getComputedStyle(x).transform)).toBe('none');
  await desktop.keyboard.press('Escape');
  const video = desktop.video();
  await context.close();
  await video.saveAs(resolve(output,'resources-preview-desktop.webm'));
  console.log('PASS desktop hover, panel transit, row stability, five types, keyboard, reduced motion');
  for (const width of [320,390,768,992]) {
    const mobile = await browser.newPage({viewport:{width,height:844},hasTouch:width < 992});
    mobile.on('pageerror', (error) => errors.push(error.message));
    await mobile.goto(serverUrl+'/resources-review-local/');
    await mobile.evaluate(()=>document.fonts.ready);
    expect(await mobile.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
    await mobile.locator('.practice-row').first().click();
    const sheet=mobile.locator('.practice-preview');
    await expect(sheet).toBeVisible();
    if (width < 992) {
      expect(await sheet.evaluate(x=>x.matches(':modal'))).toBe(true);
      if(width===390) {
        await mobile.waitForTimeout(250);
        await mobile.screenshot({path:resolve(output,'resources-demo-mobile-sheet.png')});
      }
      await mobile.keyboard.press('Escape');
      await expect(sheet).not.toBeVisible();
      await expect(mobile.locator('.practice-row').first()).toBeFocused();
      await mobile.locator('.practice-row').nth(1).click();
      await mobile.locator('.practice-close').click();
      await expect(sheet).not.toBeVisible();
      await mobile.locator('.practice-row').first().click();
      await mobile.mouse.click(4,80);
      await expect(sheet).not.toBeVisible();
    }
    expect(await mobile.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
    await mobile.close();
  }
  expect(errors).toEqual([]);
  console.log('PASS mobile sheet, focus return, close button, no overflow; no browser errors');
} catch(error) { console.error(log.slice(-3000)); throw error; }
finally {
  await browser?.close();
  if (server) {
    server.kill();
    await Promise.race([new Promise(done=>server.once('exit',done)),pause(2000)]);
  }
  for (const path of temporary.reverse()) await unlink(path);
}
