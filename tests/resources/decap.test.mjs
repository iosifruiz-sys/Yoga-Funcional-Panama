import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import yaml from 'js-yaml';

test('Decap resources have independent locale records, safe publication defaults and all formats',async()=>{
  const config=yaml.load(await readFile('public/admin/config.yml','utf8'));
  const names=config.collections.map(x=>x.name);
  assert.equal(new Set(names).size,names.length);
  for(const locale of ['es','ru','en']){
    const collection=config.collections.find(x=>x.name==='resources_'+locale);
    assert.equal(collection.folder,'src/content/resources/'+locale);
    assert.equal(collection.format,'json');
    assert.equal(collection.media_folder,'/public/resources');
    assert.equal(collection.public_folder,'/resources');
    const fields=new Map(collection.fields.map(x=>[x.name,x]));
    assert.equal(fields.get('language').default,locale);
    assert.equal(fields.get('draft').default,true);
    assert.equal(fields.get('approved').default,false);
    assert.deepEqual(fields.get('type').options,['pdf','video','audio','questionnaire','test']);
    assert.equal(fields.get('image').required,false);
    assert.equal(fields.get('relatedArticle').required,false);
    if(locale!=='en')assert.equal(fields.get('relatedArticle').collection,'blog_'+locale);
    const urlPattern=new RegExp(fields.get('url').pattern[0]);
    assert.ok(urlPattern.test('https://example.test/resource'));
    assert.ok(!urlPattern.test('https://example.test/a b'));
  }
});

test('real record maps to the CMS fields without requiring an invented blog article',async()=>{
  const config=yaml.load(await readFile('public/admin/config.yml','utf8'));
  const fields=new Set(config.collections.find(x=>x.name==='resources_es').fields.map(x=>x.name));
  const record=JSON.parse(await readFile('src/content/resources/es/que-tan-movil-eres.json','utf8'));
  for(const key of Object.keys(record))assert.ok(fields.has(key),key);
  assert.equal(record.language,'es');
  assert.equal(record.approved,true);
  assert.equal(record.draft,false);
  assert.equal(record.relatedArticle,'');
  assert.equal(record.url,'');
  assert.ok(record.file.startsWith('/resources/'));
  assert.ok(record.image.startsWith('/resources/'));
});
