import { describe, expect, it } from 'vitest';
import { optimizedSrc } from './image-url';

const FILE = '/images/_sample/camp2/sh_grey_band.jpg';
const ENCODED = encodeURIComponent(FILE);

describe('optimizedSrc', () => {
  it('is the optimizer URL of the file at the width asked for, not at twice that width', () => {
    expect(optimizedSrc(FILE, 1920)).toBe(`/_next/image?url=${ENCODED}&w=1920&q=75`);
    expect(optimizedSrc(FILE, 640)).toBe(`/_next/image?url=${ENCODED}&w=640&q=75`);
  });

  it('rounds the width up to a size Next serves', () => {
    expect(optimizedSrc(FILE, 1000)).toBe(`/_next/image?url=${ENCODED}&w=1080&q=75`);
  });

  it('leaves an SVG as it is: Next serves those without the optimizer', () => {
    expect(optimizedSrc('/images/mark.svg', 640)).toBe('/images/mark.svg');
  });
});
