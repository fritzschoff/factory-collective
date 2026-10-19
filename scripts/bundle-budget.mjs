import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET = 360_000;
const ROOT = '.next/static';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(file));
    else if (entry.name.endsWith('.js')) out.push(file);
  }
  return out;
}

const files = await walk(ROOT);
let total = 0;
for (const file of files) total += gzipSync(await readFile(file)).length;
console.log(`client js: ${files.length} files, ${total} bytes gzip (budget ${BUDGET})`);
if (total > BUDGET) {
  console.error(`client js is ${total - BUDGET} bytes gzip over the budget`);
  process.exit(1);
}
