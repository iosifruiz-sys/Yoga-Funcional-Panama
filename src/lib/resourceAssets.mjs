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

/** @param {string} url */
export async function reachable(url) {
  if (!safeHttps(url)) return false;
  try {
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(6000) });
    if (response.status === 405 || response.status === 501) {
      await response.body?.cancel();
      response = await fetch(url, { headers: { Range: 'bytes=0-0' }, redirect: 'follow', signal: AbortSignal.timeout(6000) });
    }
    const valid = response.ok && safeHttps(response.url);
    await response.body?.cancel();
    return valid;
  } catch { return false; }
}
