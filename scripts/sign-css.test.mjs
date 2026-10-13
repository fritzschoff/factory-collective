import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bracketCss } from './sign-css.mjs';

describe('bracket window CSS', () => {
  it('the committed stylesheet is what the metrics produce', () => {
    const metrics = JSON.parse(fs.readFileSync('src/lib/sign/font-metrics.json', 'utf8'));
    expect(fs.readFileSync('src/styles/generated/bwin.css', 'utf8')).toBe(bracketCss(metrics));
  });
});
