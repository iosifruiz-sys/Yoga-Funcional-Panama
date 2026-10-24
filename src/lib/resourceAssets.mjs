// Build-time file/network checks; never imported by the browser controller.
import { readFile, realpath } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';

/** @param {string} value */
const safeHttps = (value) => {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
};

/** @param {string} path @param {string} prefix */
export async function publicFile(path, prefix) {
  if (!path.startsWith(prefix) || /[?#\\]/.test(path)) return undefined;
  try {
    const root = await realpath(resolve('public'));
    const allowed = await realpath(resolve('public', `.${prefix}`));
    const file = await realpath(resolve('public', `.${path}`));
    const inside = relative(allowed, file);
    const insidePublic = relative(root, allowed);
    if (inside.startsWith('..') || isAbsolute(inside) || insidePublic.startsWith('..') || isAbsolute(insidePublic)) return undefined;
    return await readFile(file);
  } catch { return undefined; }
}

/**
 * A temporary outage is not evidence that an editor-approved destination is gone.
 * @param {string} url
 * @returns {Promise<'available' | 'unavailable' | 'temporary'>}
 */
export async function checkResourceUrl(url, { attempts = 3, timeout = 4000, delay = 250, fetcher = fetch } = {}) {
  if (!safeHttps(url)) return 'unavailable';
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      let response = await fetcher(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(timeout) });
      // Some CDNs deny or mishandle HEAD even when the actual link works.
      if ([401, 403, 404, 405, 501].includes(response.status)) {
        await response.body?.cancel();
        response = await fetcher(url, { headers: { Range: 'bytes=0-0' }, redirect: 'follow', signal: AbortSignal.timeout(timeout) });
      }
      const { status, ok } = response;
      const secure = safeHttps(response.url);
      await response.body?.cancel();
      if (!secure) return 'unavailable';
      if (ok) return 'available';
      if ([400, 404, 410, 422].includes(status)) return 'unavailable';
      // Timeouts, throttling, access challenges and 5xx remain inconclusive.
    } catch { /* Retry network errors; do not silently remove approved content. */ }
    if (attempt + 1 < attempts && delay) await new Promise((done) => setTimeout(done, delay));
  }
  return 'temporary';
}
