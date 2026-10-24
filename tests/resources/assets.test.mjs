import test from 'node:test';
import assert from 'node:assert/strict';
import { publicFile, reachable } from '../../src/lib/resourceAssets.mjs';

test('public files stay inside the resources directory', async () => {
  assert.ok((await publicFile('/resources/README.md','/resources/')).length);
  for (const path of ['/images/funcyo.png','/resources/../admin/config.yml','/resources/missing.pdf','/resources/README.md?download=1']) {
    assert.equal(await publicFile(path,'/resources/'),undefined);
  }
});

test('external destinations fail closed and retry unsupported HEAD with a bounded GET', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const response = (status,url='https://example.test/resource') => ({status,ok:status>=200&&status<300,url,body:{cancel:async()=>{}}});
  try {
    globalThis.fetch = async (url,options) => {calls.push({url,options});return response(200);};
    assert.equal(await reachable('https://example.test/resource'),true);
    assert.equal(calls[0].options.method,'HEAD');
    assert.ok(calls[0].options.signal);
    assert.equal(await reachable('http://example.test/resource'),false);
    assert.equal(await reachable('javascript:alert(1)'),false);
    assert.equal(await reachable('https://user:password@example.test/'),false);
    assert.equal(calls.length,1);
    globalThis.fetch = async (_url,options) => options.method==='HEAD'?response(405):response(206);
    assert.equal(await reachable('https://example.test/resource'),true);
    globalThis.fetch = async () => response(404);
    assert.equal(await reachable('https://example.test/resource'),false);
    globalThis.fetch = async () => response(200,'http://example.test/redirect');
    assert.equal(await reachable('https://example.test/resource'),false);
    globalThis.fetch = async () => {throw new Error('network unavailable');};
    assert.equal(await reachable('https://example.test/resource'),false);
  } finally {globalThis.fetch=originalFetch;}
});
