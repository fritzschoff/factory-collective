import fs from 'node:fs';
import path from 'node:path';
import { resolveSlot } from '../src/lib/images';

const FILE = path.resolve('IMAGE-SLOTS.md');
const LABEL = { local: 'local', sample: 'sample picture', none: 'EMPTY (placeholder)' } as const;
export type SlotSource = keyof typeof LABEL;

export function rewriteImageSlots(md: string, sourceOf: (slot: string) => SlotSource, today: string): string {
  let next = md.replace(/^(?:Generated|Status updated) by .*$/m, `Status updated by \`npm run images:report\` on ${today}.`);
  const sources: SlotSource[] = [];
  next = next.replace(/^\| `([^`]+)\.jpg` \|(.*)\| ([^|]+) \|$/gm, (_row, slot: string, middle: string) => {
    const source = sourceOf(slot);
    sources.push(source);
    return `| \`${slot}.jpg\` |${middle}| ${LABEL[source]} |`;
  });
  const n = (source: SlotSource) => sources.filter((item) => item === source).length;
  return next.replace(/\*\*\d+ slots\*\* · \d+ real pictures · \d+ sample pictures · \d+ empty\./, `**${sources.length} slots** · ${n('local')} real pictures · ${n('sample')} sample pictures · ${n('none')} empty.`);
}

if (process.argv[1]?.endsWith('images-report.ts')) {
  const today = new Date().toISOString().slice(0, 10);
  const md = rewriteImageSlots(fs.readFileSync(FILE, 'utf8'), (slot) => resolveSlot(slot, 'local').source, today);
  fs.writeFileSync(FILE, md);
  const slots = md.match(/\*\*(\d+) slots\*\* · (\d+) real pictures · (\d+) sample pictures · (\d+) empty\./);
  console.log(`IMAGE-SLOTS.md: ${slots?.[1]} slots, ${slots?.[2]} real, ${slots?.[3]} samples, ${slots?.[4]} empty`);
}
