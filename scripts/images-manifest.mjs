#!/usr/bin/env node
/**
 * Lists the real pictures in public/images (everything except _sample/) so slots resolve
 * without touching the file system while pages render (Vercel functions do not carry public/).
 * Writes src/generated/image-manifest.json — runs before `dev` and `build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'public/images');
const OUT = path.join(ROOT, 'src/generated/image-manifest.json');
const EXT = /\.(jpe?g|png|webp|avif)$/i;

const walk = (dir) => (!fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])));

/** absolute file paths → { slots: { 'fashion/JK-001': '/images/fashion/JK-001.jpg' } } */
export function buildManifest(files) {
  const slots = {};
  for (const abs of files) {
    const rel = path.relative(DIR, abs).split(path.sep).join('/');
    if (!EXT.test(rel) || rel.startsWith('_')) continue;
    slots[rel.replace(EXT, '')] = `/images/${rel}`;
  }
  return { slots: Object.fromEntries(Object.entries(slots).sort(([a], [b]) => a.localeCompare(b))) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = buildManifest(walk(DIR));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`image manifest: ${Object.keys(manifest.slots).length} real pictures`);
}
