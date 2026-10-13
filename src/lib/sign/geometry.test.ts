import { describe, expect, it } from 'vitest';
import { HEADER_PAD_EM, signAdvances, signGeometry, windowShape } from './geometry';

describe('sign geometry', () => {
  it('spans 19.596 em with ATELIER in the brackets', () => {
    expect(signGeometry().tot).toBeCloseTo(19.5964, 3);
  });
  it('lists the nine pieces of the sign in order', () => {
    const adv = signAdvances();
    expect(adv).toHaveLength(9);
    expect(adv[0]).toBeCloseTo(0.778, 3); // C
    expect(adv[3]).toBeCloseTo(0.389, 3); // (
    expect(adv.reduce((a, c) => a + c, 0)).toBeCloseTo(signGeometry().tot, 6);
  });
  it('puts the A axis in the middle of the brackets', () => {
    const g = signGeometry();
    expect(g.xA).toBeGreaterThan(g.brL);
    expect(g.xA).toBeLessThan(g.brR);
    expect(g.xA).toBeCloseTo((g.brL + g.brR) / 2, 2);
  });
});

describe('window shape', () => {
  const { d, viewBox } = windowShape('ATELIER', 0.109);
  const nums = (s: string) => (s.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

  it('is a white row with exactly one hole', () => {
    expect(d.match(/M/g)).toHaveLength(2);
    expect(d.match(/Z/g)).toHaveLength(2);
  });
  it('covers the row including the side padding', () => {
    expect(nums(viewBox)).toEqual([-0.109, 0, 19.8144, 1]);
  });
  it('cuts the hole between the inner contours of the brackets, slightly under them', () => {
    const hole = nums(d.slice(d.indexOf('Z') + 1));
    const xs = hole.filter((_, i) => i % 2 === 0);
    const ys = hole.filter((_, i) => i % 2 === 1);
    expect(Math.min(...xs)).toBeCloseTo(6.2646, 3);
    expect(Math.max(...xs)).toBeCloseTo(11.3305, 3);
    expect(Math.min(...ys)).toBeCloseTo(0.095, 3);
    expect(Math.max(...ys)).toBeCloseTo(0.9925, 3);
  });
  it('the header padding is .55 % of the width, in em of the sign', () => {
    expect(HEADER_PAD_EM).toBeCloseTo(0.109, 3);
  });
});
