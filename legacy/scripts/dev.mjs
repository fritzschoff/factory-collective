#!/usr/bin/env node
/** Development: build, serve with live reload, rebuild on every change in src/, public/, data/, server/. */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './lib/env.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnv(ROOT);
process.env.DEV = '1';
const { build } = await import('./build.mjs');

let child = null;
const start = () => { child = spawn(process.execPath, [path.join(ROOT, 'dist-server/server.mjs')], { stdio: 'inherit', env: process.env }); };
const run = async () => {
  try { await build(); fs.writeFileSync(path.join(ROOT, 'dist/.stamp'), String(Date.now())); } catch (e) { console.error('build failed:', e.message); }
};
await run(); start();
let t = null, dirty = new Set();
const onChange = (dir) => (ev, file) => {
  if (!file || /(^|[\\/])(\.|IMAGE-SLOTS|_v[\\/])/.test(file)) return;
  dirty.add(dir);
  clearTimeout(t);
  t = setTimeout(async () => {
    const serverChanged = dirty.has('server'); dirty = new Set();
    console.log('· change detected, rebuilding …'); await run();
    if (serverChanged && child) { child.kill(); start(); }
  }, 250);
};
for (const d of ['src', 'public', 'data', 'server']) { const p = path.join(ROOT, d); if (fs.existsSync(p)) fs.watch(p, { recursive: true }, onChange(d)); }
console.log(`\n  dev server → http://localhost:${process.env.PORT || 3000}   (live reload on)\n`);
process.on('SIGINT', () => { child?.kill(); process.exit(0); });
