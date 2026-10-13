import path from 'node:path';
import fs from 'node:fs';
import { build } from 'esbuild';
/** Bundle src/content/catalog.ts on the fly so plain-node scripts (stripe:seed / sync) can read the TypeScript catalogue. */
export async function loadCatalog(root) {
  const out = path.join(root, '.cache', 'catalog.mjs');
  await build({
    entryPoints: [path.join(root, 'src/content/catalog.ts')], outfile: out, bundle: true, format: 'esm', platform: 'node', logLevel: 'silent', packages: 'external'
  });
  const mod = await import(out + '?t=' + Date.now());
  return mod;
}
export function readJson(f, fallback) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; } }
