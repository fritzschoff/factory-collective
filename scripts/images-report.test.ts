import { describe, expect, it } from 'vitest';
import { rewriteImageSlots } from './images-report';

describe('image slot report', () => {
  it('rewrites the status of each slot and the count line', () => {
    const md = [
      'Status updated by `npm run images:report` on 2020-01-01.',
      '',
      '**2 slots** · 0 real pictures · 2 sample pictures · 0 empty.',
      '',
      '| `fashion/JK-001.jpg` | wool | sample picture |',
      '| `art/CI-07.jpg` | plate | sample picture |',
    ].join('\n');
    const out = rewriteImageSlots(md, (slot) => (slot.startsWith('fashion') ? 'local' : 'none'), '2026-10-19');
    expect(out).toContain('on 2026-10-19.');
    expect(out).toContain('**2 slots** · 1 real pictures · 0 sample pictures · 1 empty.');
    expect(out).toContain('| `fashion/JK-001.jpg` | wool | local |');
    expect(out).toContain('| `art/CI-07.jpg` | plate | EMPTY (placeholder) |');
  });
});