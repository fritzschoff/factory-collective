// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/' }));
import { SecHead } from '@/components/blocks';
import { Soon } from '@/components/soon';
import { Tile } from '@/components/tiles';
import { Img, Register } from '@/components/ui';

describe('ui', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('Img shows the named placeholder when a slot has no picture', () => {
    vi.stubEnv('IMAGES', 'placeholders');
    render(<Img slot="fashion/JK-001" ratio="4/5" />);
    expect(screen.getByRole('img', { name: 'Placeholder: fashion/JK-001' })).toBeInTheDocument();
  });

  it('Img renders an optimised picture for a sample slot', () => {
    vi.stubEnv('IMAGES', 'local');
    const { container } = render(<Img slot="fashion/SH-001" ratio="4/5" alt="SH / 001" />);
    expect(container.querySelector('img')?.getAttribute('src')).toContain(encodeURIComponent('/images/_sample/camp2/sh_grey_band.jpg'));
  });

  it('Soon is red text, never a link', () => {
    const { container } = render(<Soon k="furniture" />);
    expect(container.querySelector('a')).toBeNull();
    expect(container).toHaveTextContent('Furniture ( )coming soon');
  });

  it('Tile links the product, shows the price and an Add button', () => {
    const p = { ...PRODUCTS.find((x) => x.id === 'SH-001')!, priceCents: 26000 };
    renderWithChrome(<Tile p={p} />);
    expect(screen.getByRole('link', { name: 'SH / 001 shirt, grey band' })).toHaveAttribute('href', '/atelier/fashion/sh-001/');
    expect(screen.getByText('€ 260')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('SecHead and Register turn soon entries into labels', () => {
    const { container } = render(
      <>
        <SecHead kick="k" title="t" text="x" links={[{ label: 'Bags', href: '/atelier/bags/' }, { label: 'Read the text', soon: 'bagText' }]} />
        <Register rows={[{ no: '03', name: 'Bag / Profile Series', soon: 'bagText' }]} />
      </>,
    );
    expect([...container.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(['/atelier/bags/']);
    expect(container.querySelectorAll('.soon')).toHaveLength(2);
  });
});
