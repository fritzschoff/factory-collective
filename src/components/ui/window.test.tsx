// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Lens } from './window';

const FILE = encodeURIComponent('/images/_sample/camp2/sh_grey_band.jpg');

describe('Lens', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('draws the blurred picture and the sharp one from the very same optimised file, so they stay aligned', () => {
    vi.stubEnv('IMAGES', 'local');
    const { container } = render(<Lens slot="fashion/SH-001" />);
    const blurred = container.querySelector<HTMLElement>('.lens__bg')!.style.backgroundImage;
    const sharp = container.querySelector<HTMLElement>('.lens__sharp')!.style.backgroundImage;
    expect(blurred).toContain(`/_next/image?url=${FILE}&w=1920&q=75`);
    expect(blurred).not.toContain('url("/images/');
    expect(sharp).toBe(blurred);
  });

  it('a slot without a picture still shows the placeholder that names it', () => {
    vi.stubEnv('IMAGES', 'placeholders');
    const { container } = render(<Lens slot="fashion/SH-001" />);
    expect(container.querySelector('.lens__bg')).toHaveClass('img--ph');
    expect(container.querySelector('.ph__id')).toHaveTextContent('fashion/SH-001');
    expect(container.querySelector<HTMLElement>('.lens__bg')!.style.backgroundImage).toBe('');
  });
});
