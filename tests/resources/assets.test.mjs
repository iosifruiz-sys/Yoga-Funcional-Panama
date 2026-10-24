import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { publicFile, checkResourceUrl } from '../../src/lib/resourceAssets.mjs';

test('approved original PDF is unchanged and its real preview exists',async()=>{
  const bytes=await publicFile('/resources/que-tan-movil-eres.pdf','/resources/');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),'4150c89b9df488118acf239469c3ea86c86516dff1f40caad4c6e5e5bedcd94d');
  assert.ok((await publicFile('/resources/que-tan-movil-eres-preview.png','/resources/')).length);
});

test('public files stay inside the resources directory', async () => {
  assert.ok((await publicFile('/resources/README.md','/resources/')).length);
  for (const path of ['/images/funcyo.png','/resources/../admin/config.yml','/resources/missing.pdf','/resources/README.md?download=1']) {
    assert.equal(await publicFile(path,'/resources/'),undefined);
  }
});

const response = (status,url='https://example.test/resource') => ({status,ok:status>=200&&status<300,url,body:{cancel:async()=>{}}});
test('external links distinguish confirmed errors from temporary failures', async () => {
  const calls = [];
  const options = {delay:0,fetcher:async(url,request)=>{calls.push({url,request});return response(200);}};
  assert.equal(await checkResourceUrl('https://example.test/resource',options),'available');
  assert.equal(calls[0].request.method,'HEAD');
  assert.ok(calls[0].request.signal);
  for (const url of ['http://example.test/','javascript:alert(1)','https://user:password@example.test/']) {
    assert.equal(await checkResourceUrl(url,options),'unavailable');
  }
  assert.equal(calls.length,1);
  for(const status of [401,403,404,405,501]) {
    const methods=[];
    assert.equal(await checkResourceUrl('https://example.test/',{delay:0,fetcher:async(_url,request)=>{methods.push(request);return request.method==='HEAD'?response(status):response(206);}}),'available');
    assert.equal(methods[1].headers.Range,'bytes=0-0');
  }
  for(const status of [400,404,410,422]) {
    assert.equal(await checkResourceUrl('https://example.test/',{delay:0,fetcher:async()=>response(status)}),'unavailable');
  }
  for(const status of [408,429,500,503]) {
    let attempts=0;
    assert.equal(await checkResourceUrl('https://example.test/',{delay:0,fetcher:async()=>{attempts++;return response(status);}}),'temporary');
    assert.equal(attempts,3);
  }
  let attempts=0;
  assert.equal(await checkResourceUrl('https://example.test/',{delay:0,fetcher:async()=>{if(++attempts<3)throw Error('timeout');return response(200);}}),'available');
  assert.equal(attempts,3);
  assert.equal(await checkResourceUrl('https://example.test/',{delay:0,fetcher:async()=>{throw Error('offline');}}),'temporary');
  assert.equal(await checkResourceUrl('https://example.test/',{delay:0,fetcher:async()=>response(200,'http://example.test/redirect')}),'unavailable');
});
