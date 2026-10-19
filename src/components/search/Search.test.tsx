// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChrome } from '@/components/chrome/ChromeProvider';
import type { SearchEntry } from '@/lib/search/index';
import { renderWithChrome } from '@/test/chrome';

const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: () => '/',
  useRouter: () => ({ push }),
}));
import { Search } from './Search';

/** Fashion pieces, enough that the list runs past the fold. */
const INDEX: SearchEntry[] = Array.from({ length: 12 }, (_, i) => ({ k: 'Fashion', n: `JK / ${String(i + 1).padStart(3, '0')} jacket`, s: 'wool', h: `/atelier/fashion/jk-${i + 1}/`, i: null, p: null }));

/** Stands in for the header's Search button. */
function Open() {
  const { openSearch } = useChrome();
  return <button type="button" onClick={openSearch}>open</button>;
}

describe('Search: the arrow keys', () => {
  // jsdom has no scrollIntoView; the spy records which element it was called on
  const scrolled = vi.fn<(options?: ScrollIntoViewOptions) => void>();
  beforeEach(() => {
    Element.prototype.scrollIntoView = scrolled;
  });
  afterEach(() => {
    scrolled.mockClear();
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  const type = (value: string) => {
    renderWithChrome(<><Open /><Search index={INDEX} /></>);
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    const input = screen.getByRole('combobox', { name: 'Search the site' });
    fireEvent.change(input, { target: { value } });
    return input;
  };
  const rows = () => [...document.querySelectorAll<HTMLElement>('.sres__a')];

  it('scroll the selected row into view, the nearest edge only', () => {
    const input = type('jacket');
    expect(scrolled).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(rows()[0]).toHaveClass('is-sel');
    expect(input).toHaveAttribute('aria-activedescendant', rows()[0].id);
    expect(scrolled).toHaveBeenLastCalledWith({ block: 'nearest' });
    expect(scrolled.mock.contexts.at(-1)).toBe(rows()[0]);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(rows()[2]).toHaveClass('is-sel');
    expect(scrolled.mock.contexts.at(-1)).toBe(rows()[2]);
  });

  it('ArrowUp from nothing selected goes to the last row and scrolls to it', () => {
    const input = type('jacket');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(rows()).toHaveLength(12);
    expect(rows()[11]).toHaveClass('is-sel');
    expect(scrolled.mock.contexts.at(-1)).toBe(rows()[11]);
  });

  it('typing again selects nothing and scrolls nowhere', () => {
    const input = type('jacket');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    scrolled.mockClear();
    fireEvent.change(input, { target: { value: 'jacket 0' } });
    expect(document.querySelector('.is-sel')).toBeNull();
    expect(scrolled).not.toHaveBeenCalled();
  });

  it('Enter during composition does not open a row', () => {
    const input = type('jacket');
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(push).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(push).toHaveBeenCalledWith(INDEX[0].h);
  });
});
