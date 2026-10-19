// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { toSummary } from '@/lib/products/summary';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/bag/' }));
import { BagView } from './BagView';

const products = Object.fromEntries(PRODUCTS.map((p) => [p.id, toSummary({ ...p, priceCents: p.id === 'OB-011' ? 32000 : null })]));

describe('BagView', () => {
  afterEach(() => { localStorage.clear(); vi.unstubAllEnvs(); });

  it('an empty bag says so', () => {
    renderWithChrome(<BagView products={products} />);
    expect(screen.getByText('Your bag is empty.')).toBeInTheDocument();
  });

  it('lists lines, changes quantities, skips products that no longer exist', async () => {
    localStorage.setItem('cfc.bag.v1', JSON.stringify([{ id: 'OB-011', qty: 1, opts: {} }, { id: 'GONE-1', qty: 2, opts: {} }]));
    renderWithChrome(<BagView products={products} />);
    expect(screen.getAllByRole('article')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'One more' }));
    expect(screen.getAllByText('€ 640').length).toBeGreaterThan(0);
    // Ruling P25: the unknown line is dropped from the stored bag, so the header count corrects itself
    await waitFor(() => expect(JSON.parse(localStorage.getItem('cfc.bag.v1')!).map((l: { id: string }) => l.id)).not.toContain('GONE-1'));
    expect(JSON.parse(localStorage.getItem('cfc.bag.v1')!)).toMatchObject([{ id: 'OB-011', qty: 2 }]);
  });

  it('checkout says it is not connected yet', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', '');
    localStorage.setItem('cfc.bag.v1', JSON.stringify([{ id: 'OB-011', qty: 1, opts: {} }]));
    renderWithChrome(<BagView products={products} />);
    fireEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(await screen.findByText('Checkout is not connected yet.')).toBeInTheDocument();
  });

  it('ignores a second click on Checkout while the first request is on its way (Ruling P39)', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.test');
    let resolve!: (r: Response) => void;
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method !== 'POST') return new Response(JSON.stringify({ products: [], items: {} }), { status: 200 });
      return new Promise<Response>((r) => { resolve = r; });
    });
    vi.stubGlobal('fetch', fetchMock);
    localStorage.setItem('cfc.bag.v1', JSON.stringify([{ id: 'OB-011', qty: 1, opts: {} }]));
    renderWithChrome(<BagView products={products} />);
    const button = screen.getByRole('button', { name: 'Checkout' });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(fetchMock.mock.calls.filter((call) => call[1]?.method === 'POST')).toHaveLength(1));
    expect(screen.getByRole('button', { name: 'One moment …' })).toBeDisabled();
    resolve(new Response(JSON.stringify({ error: 'Sold out.' }), { status: 409 }));
    expect(await screen.findByText('Sold out.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeEnabled();
    vi.unstubAllGlobals();
  });
});
