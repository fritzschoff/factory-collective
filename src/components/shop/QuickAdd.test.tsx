// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { toSummary } from '@/lib/products/summary';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/' }));
import { QuickAddButton } from './QuickAdd';

const summary = (id: string) => toSummary({ ...PRODUCTS.find((p) => p.id === id)!, priceCents: 26000 });
const stored = () => JSON.parse(localStorage.getItem('cfc.bag.v1') ?? '[]');

describe('QuickAddButton', () => {
  afterEach(() => localStorage.clear());

  it('asks for the choices first and adds with them', () => {
    renderWithChrome(<QuickAddButton product={summary('SH-001')} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: '52' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(stored()[0]).toMatchObject({ id: 'SH-001', qty: 1, opts: { colour: { v: 'light-grey' }, size: { v: '52' } } });
    expect(screen.getByRole('status')).toHaveTextContent('SH / 001 // shirt, grey band is in your bag.');
  });

  it('prints with a choice of state send you to the work page', () => {
    renderWithChrome(<QuickAddButton product={summary('LP-02.P')} />);
    expect(screen.getByRole('link', { name: 'Choose & add' })).toHaveAttribute('href', '/studio/layer-paintings/lp-02/');
  });
});
