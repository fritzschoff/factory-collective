import { describe, expect, it } from 'vitest';
import { fmtDate, fmtPrice } from './format';

describe('format', () => {
  it('prices: euro sign, a space, no cents for whole amounts', () => {
    expect(fmtPrice(4500)).toBe('€ 45');
    expect(fmtPrice(28050)).toBe('€ 280.50');
    expect(fmtPrice(null)).toBe('€ [price]');
  });
  it('dates of the title blocks', () => {
    expect(fmtDate('2026-10-13')).toBe('13.10.2026');
    expect(fmtDate('')).toBe('');
  });
});
