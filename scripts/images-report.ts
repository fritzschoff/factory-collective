/** Rewrites the Status column, the count line and the date line of IMAGE-SLOTS.md from the current files. */
import fs from 'node:fs';
import path from 'node:path';
import { resolveSlot } from '../src/lib/images';

// npm scripts run in the project root (tsx runs this file as CommonJS, so no import.meta)
const FILE = path.resolve('IMAGE-SLOTS.md');
const LABEL = { local: 'local', sample: 'sample picture', none: 'EMPTY (placeholder)' } as const;

let md = fs.readFileSync(FILE, 'utf8');
md = md.replace(/^(?:Generated|Status updated) by .*$/m, `Status updated by \`npm run images:report\` on ${new Date().toISOString().slice(0, 10)}.`);
const sources: (keyof typeof LABEL)[] = [];
md = md.replace(/^\| `([^`]+)\.jpg` \|(.*)\| ([^|]+) \|$/gm, (_row, slot: string, middle: string) => {
  const { source } = resolveSlot(slot, 'local');
  sources.push(source);
  return `| \`${slot}.jpg\` |${middle}| ${LABEL[source]} |`;
});
const n = (s: keyof typeof LABEL) => sources.filter((x) => x === s).length;
md = md.replace(/\*\*\d+ slots\*\* · \d+ real pictures · \d+ sample pictures · \d+ empty\./, `**${sources.length} slots** · ${n('local')} real pictures · ${n('sample')} sample pictures · ${n('none')} empty.`);
fs.writeFileSync(FILE, md);
console.log(`IMAGE-SLOTS.md: ${sources.length} slots, ${n('local')} real, ${n('sample')} samples, ${n('none')} empty`);
