// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Elevation } from './elevation';

const FILE = encodeURIComponent('/images/_sample/camp2/sh_grey_band.jpg');

describe('Elevation', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('draws the work from the optimizer, at the width of the drawing', () => {
    vi.stubEnv('IMAGES', 'local');
    const { container } = render(<Elevation slots={['fashion/SH-001']} cw={60} ch={80} label="Wall" />);
    expect(container.querySelector('image')?.getAttribute('href')).toBe(`/_next/image?url=${FILE}&w=640&q=75`);
  });

  it('a slot without a picture keeps its name in the frame', () => {
    vi.stubEnv('IMAGES', 'placeholders');
    const { container } = render(<Elevation slots={['fashion/SH-001']} cw={60} ch={80} label="Wall" />);
    expect(container.querySelector('image')).toBeNull();
    expect(container.querySelector('text.e-ph')).toHaveTextContent('fashion/SH-001');
  });
});
