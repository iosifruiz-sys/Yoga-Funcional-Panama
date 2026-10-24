// Build with the sole real resource temporarily set to draft, then restore it.
// Run a normal build afterwards to restore the production output for review.
import { readFile, writeFile, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const record='src/content/resources/es/que-tan-movil-eres.json';
const original=await readFile(record,'utf8');
try {
  await writeFile(record,JSON.stringify({...JSON.parse(original),draft:true},null,2)+'\n');
  const run=spawn(process.execPath,['node_modules/astro/astro.js','build'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  let log='';
  for(const stream of [run.stdout,run.stderr])stream.on('data',chunk=>{log+=chunk;});
  const code=await new Promise((done,reject)=>{run.on('exit',done);run.on('error',reject);});
  assert.equal(code,0,log);
  await assert.rejects(access('dist/recursos/index.html'));
  assert.ok(!(await readFile('dist/sitemap.xml','utf8')).includes('/recursos/'));
  for(const path of ['dist/index.html','dist/blog/index.html','dist/ru/index.html','dist/ru/blog/index.html']) {
    assert.ok(!(await readFile(path,'utf8')).includes('href="/recursos/"'),path);
  }
  console.log('PASS no published resources: no catalog route, navigation or sitemap entry; build successful.');
}finally{await writeFile(record,original);}
