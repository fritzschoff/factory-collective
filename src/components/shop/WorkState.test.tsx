// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { toSummary } from '@/lib/products/summary';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/studio/layer-paintings/lp-02/' }));
import { EditionAdd, StatePick, WorkStateProvider } from './WorkState';

const archival = toSummary({ ...PRODUCTS.find((p) => p.id === 'LP-02.A')!, priceCents: 16000 });
const stored = () => JSON.parse(localStorage.getItem('cfc.bag.v1') ?? '[]');
const options = [1, 2, 3].map((n) => ({ value: String(n), label: `State 0${n}`, image: null, sub: null }));

describe('WorkState', () => {
  afterEach(() => localStorage.clear());

  it('adds the print with the state that is picked', () => {
    renderWithChrome(<WorkStateProvider initial="2"><StatePick options={options} /><EditionAdd product={archival} needsState /></WorkStateProvider>);
    expect(screen.getByRole('radio', { name: /State 02/ })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: /State 03/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose a state · Add' }));
    expect(stored()[0]).toMatchObject({ id: 'LP-02.A', qty: 1, opts: { state: { v: '3', l: 'State 03' } } });
  });

  it('adds the state shown checked, also one clicked before hydration (Ruling P53)', () => {
    renderWithChrome(<WorkStateProvider initial="2"><StatePick options={options} /><EditionAdd product={archival} needsState /></WorkStateProvider>);
    // before hydration a click moves only the native state of the radios: React never hears of it
    (screen.getByRole('radio', { name: /State 03/ }) as HTMLInputElement).checked = true;
    fireEvent.click(screen.getByRole('button', { name: 'Choose a state · Add' }));
    expect(stored()[0]).toMatchObject({ id: 'LP-02.A', opts: { state: { v: '3', l: 'State 03' } } });
  });

  it('asks for a state first when none is chosen', () => {
    renderWithChrome(<WorkStateProvider initial={null}><EditionAdd product={archival} needsState /></WorkStateProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Choose a state · Add' }));
    expect(stored()).toEqual([]);
    const msg = screen.getAllByRole('status').find((el) => el.classList.contains('buy__msg'))!;
    expect(msg).toHaveTextContent('Choose a state first.');
    expect(msg).toHaveClass('is-err');
  });

  it('adds a print without states as it is', () => {
    const poster = toSummary({ ...PRODUCTS.find((p) => p.id === 'CI-07.P')!, priceCents: 4500 });
    renderWithChrome(<WorkStateProvider initial={null}><EditionAdd product={poster} needsState={false} /></WorkStateProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(stored()[0]).toMatchObject({ id: 'CI-07.P', qty: 1, opts: {} });
  });

  it('ignores a second click while it shows Added', () => {
    renderWithChrome(<WorkStateProvider initial="2"><EditionAdd product={archival} needsState /></WorkStateProvider>);
    const button = screen.getByRole('button', { name: 'Choose a state · Add' });
    button.focus();
    fireEvent.click(button);
    fireEvent.click(button);
    expect(stored()).toHaveLength(1);
    expect(stored()[0].qty).toBe(1);
    const added = screen.getByRole('button', { name: /^Added/ });
    expect(added).toHaveAttribute('aria-disabled', 'true');
    expect(added).toHaveFocus();
  });
});
