// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { toSummary } from '@/lib/products/summary';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/' }));
import { ShopPoint } from './marks';

const shirt = toSummary({ ...PRODUCTS.find((p) => p.id === 'SH-001')!, priceCents: 26000 });
const point = { px: 40, py: 50, lx: 60, ly: 30, code: 'SH / 001', name: 'shirt, grey band', href: '/atelier/fashion/sh-001/' };

describe('ShopPoint', () => {
  it('points at the piece and offers Add when it is given a product', () => {
    renderWithChrome(<ShopPoint {...point} price="€ 260" product={shirt} />);
    expect(screen.getByRole('link', { name: 'SH / 001 shirt, grey band' })).toHaveAttribute('href', '/atelier/fashion/sh-001/');
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View' })).toBeNull();
  });

  it('offers View instead when there is no product to add', () => {
    renderWithChrome(<ShopPoint {...point} />);
    expect(screen.queryByRole('button', { name: 'Add' })).toBeNull();
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/atelier/fashion/sh-001/');
    expect(screen.getByText(/€ \[price\]/)).toBeInTheDocument();
  });
});
