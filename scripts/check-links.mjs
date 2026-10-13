#!/usr/bin/env node
/** Crawls dist/: every internal link, #anchor, image, srcset entry and stylesheet url must exist. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
if (!fs.existsSync(DIST)) { console.error('dist/ missing — run npm run build first'); process.exit(1); }
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const route = (f) => '/' + path.relative(DIST, f).split(path.sep).join('/').replace(/index\.html$/, '');
const ids = new Map();
const html = new Map();
for (const f of pages) { const s = fs.readFileSync(f, 'utf8'); html.set(f, s); ids.set(route(f), new Set([...s.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))); }
const exists = (u) => { const p = decodeURIComponent(u.split('?')[0].split('#')[0]); const f = path.join(DIST, p); return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html'))); };
const problems = []; let links = 0, assets = 0;
for (const [f, s] of html) {
  const from = route(f);
  for (const m of s.matchAll(/\s(?:href|src|data-win)="([^"]*)"/g)) {
    for (const raw of m[1].split('|')) {
      const u = raw.trim(); if (!u || /^(https?:|mailto:|tel:|#$|javascript:|data:)/.test(u)) continue;
      const isAsset = /\.(jpe?g|png|webp|avif|svg|css|js|woff2?|json|xml|txt)(\?|$)/i.test(u);
      if (u.startsWith('#')) { if (!ids.get(from)?.has(u.slice(1))) problems.push(`${from}  →  ${u}  (anchor missing)`); continue; }
      if (!u.startsWith('/')) continue;
      isAsset ? assets++ : links++;
      if (!exists(u)) { problems.push(`${from}  →  ${u}  (not found)`); continue; }
      const h = u.split('#')[1]; if (h && !isAsset) { const t = ids.get(u.split('#')[0].split('?')[0]); if (t && !t.has(h)) problems.push(`${from}  →  ${u}  (anchor missing on target)`); }
    }
  }
  for (const m of s.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(',')) { const u = part.trim().split(/\s+/)[0]; assets++; if (u.startsWith('/') && !exists(u)) problems.push(`${from}  →  ${u}  (srcset)`); }
  for (const m of s.matchAll(/url\('?([^')]+)'?\)/g)) { const u = m[1]; if (u.startsWith('/')) { assets++; if (!exists(u)) problems.push(`${from}  →  ${u}  (css url)`); } }
}
console.log(`${pages.length} pages · ${links} links · ${assets} assets checked`);
const uniq = [...new Set(problems)];
if (uniq.length) { console.log(`\n${uniq.length} problem(s):`); uniq.slice(0, 80).forEach((p) => console.log(' ✗', p)); process.exit(1); }
console.log('✓ no broken links');
