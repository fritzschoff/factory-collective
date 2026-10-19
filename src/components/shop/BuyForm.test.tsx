// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { toSummary } from '@/lib/products/summary';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/atelier/fashion/sh-001/' }));
import { BuyForm } from './BuyForm';

describe('BuyForm', () => {
  afterEach(() => localStorage.clear());

  it('starts on the middle size and adds the chosen options', () => {
    const p = toSummary({ ...PRODUCTS.find((x) => x.id === 'SH-001')!, priceCents: 26000 });
    renderWithChrome(<BuyForm product={p} note="Ships in 5 days." />);
    expect(screen.getByRole('radio', { name: '50' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Chambray' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(JSON.parse(localStorage.getItem('cfc.bag.v1')!)[0]).toMatchObject({ id: 'SH-001', opts: { colour: { v: 'chambray', l: 'Chambray' }, size: { v: '50', l: '50' } } });
    expect(screen.getByRole('button', { name: /^Added/ })).toBeDisabled();
  });

  it('adds the options shown checked, also ones clicked before hydration (Ruling P53)', () => {
    const p = toSummary({ ...PRODUCTS.find((x) => x.id === 'SH-001')!, priceCents: 26000 });
    renderWithChrome(<BuyForm product={p} note="" />);
    // before hydration a click moves only the native state of the radios: React never hears of it
    (screen.getByRole('radio', { name: '54' }) as HTMLInputElement).checked = true;
    (screen.getByRole('radio', { name: 'White' }) as HTMLInputElement).checked = true;
    fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(JSON.parse(localStorage.getItem('cfc.bag.v1')!)[0].opts).toEqual({ colour: { v: 'white', l: 'White' }, size: { v: '54', l: '54' } });
  });

  it('a monogram is optional and kept in capitals', () => {
    const p = toSummary({ ...PRODUCTS.find((x) => x.id === 'BG-114')!, priceCents: 124000 });
    renderWithChrome(<BuyForm product={p} note="" />);
    fireEvent.change(screen.getByPlaceholderText('Optional'), { target: { value: 'mf' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(JSON.parse(localStorage.getItem('cfc.bag.v1')!)[0].opts.monogram).toEqual({ v: 'mf', l: 'MF' });
  });

  it('ignores a second submit while it shows Added', () => {
    const p = toSummary({ ...PRODUCTS.find((x) => x.id === 'SH-001')!, priceCents: 26000 });
    const { container } = renderWithChrome(<BuyForm product={p} note="" />);
    const form = container.querySelector('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    const bag = JSON.parse(localStorage.getItem('cfc.bag.v1')!);
    expect(bag).toHaveLength(1);
    expect(bag[0].qty).toBe(1);
  });

  it('keeps the empty status line after the note, as the layout counts it in the spacing', () => {
    const p = toSummary({ ...PRODUCTS.find((x) => x.id === 'SH-001')!, priceCents: 26000 });
    const { container } = renderWithChrome(<BuyForm product={p} note="Ships in 5 days." />);
    const form = container.querySelector('form')!;
    const status = form.querySelector('p.buy__msg')!;
    expect(status).toHaveAttribute('role', 'status');
    expect(status).toBeEmptyDOMElement();
    expect(form.querySelector('p.buy__note')!.nextElementSibling).toBe(status);
  });
});
