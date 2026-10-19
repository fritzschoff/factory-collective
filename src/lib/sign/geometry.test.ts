import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HEADER_PAD_EM, signAdvances, signGeometry, windowShape } from './geometry';

describe('sign geometry', () => {
  it('spans 19.596 em with ATELIER in the brackets', () => {
    expect(signGeometry().tot).toBeCloseTo(19.5964, 3);
  });
  // The stylesheets work out the height of the sign row as its width / tot, with tot written out: a change of the font
  // metrics has to change them too, or the header and the menu are drawn for the old sign.
  it.each(['header.css', 'menu.css'])('is the number %s divides the width of the sign by', (file) => {
    const css = fs.readFileSync(new URL(`../../styles/${file}`, import.meta.url), 'utf8');
    const divisors = [...css.matchAll(/98\.9(?:cqw| \* var\(--u\)) \/ ([\d.]+)/g)].map((m) => Number(m[1]));
    expect(divisors.length).toBeGreaterThan(0);
    expect(new Set(divisors)).toEqual(new Set([signGeometry().tot]));
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
