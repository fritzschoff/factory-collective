// @vitest-environment jsdom
import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithChrome } from '@/test/chrome';

// `pending` makes the address suspend, as it does under cacheComponents on a route whose params are not known at build time
const nav = vi.hoisted(() => ({ path: '/', pending: false, never: new Promise<string>(() => {}) }));
vi.mock('next/navigation', async (importOriginal) => {
  const { use } = await import('react');
  return { ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => (nav.pending ? use(nav.never) : nav.path) };
});
import { Header } from './Header';

/** The ( and ) beside Atelier in the room row of the header, on the page at `path`. */
function bracketsOn(path: string): string[] {
  nav.path = path;
  const { container } = renderWithChrome(<Header />);
  return [...container.querySelectorAll('.hd__br')].map((b) => b.textContent ?? '');
}

// The old site showed them on every page except in the Factory and Studio rooms. Campaigns, About and Contact are rooms
// of their own in the menu now (worldOf), but they have no bracket in their label to take the place of these two.
describe('Header: the ( ) beside Atelier', () => {
  it.each(['/', '/atelier/', '/atelier/fashion/', '/campaigns/', '/campaigns/01/', '/about/', '/contact/', '/bag/'])('%s has both', (path) => {
    expect(bracketsOn(path)).toEqual(['(', ')']);
  });

  it.each([['/factory/', '( Factory )'], ['/studio/', '( Studio )'], ['/studio/conceptual-interference/', '( Studio )']])('%s has none: the room carries them in its label', (path, label) => {
    expect(bracketsOn(path)).toEqual([]);
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });
});

// What reads the address waits in a boundary of its own, and the boundaries are small (see Small in Header.tsx): a
// boundary around the header would be sent after the shell on a big page and revealed some 300 ms late.
describe('Header: while the address is pending', () => {
  afterEach(() => { nav.pending = false; });

  it('stays on show: only the room labels and the brackets wait', async () => {
    nav.pending = true;
    const { container } = renderWithChrome(<Header />);
    await act(async () => {}); // a component that suspends inside act needs an awaited act, or the effects of the others do not run
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Bag/ })).toBeInTheDocument();
    expect(container.querySelector('.hd__sign')).not.toBeNull();
    expect(screen.queryByRole('button', { name: /Factory|Atelier|Studio|Campaigns|About/ })).toBeNull();
    expect(container.querySelectorAll('.hd__br')).toHaveLength(0);
  });
});

// Every button of the header that opens the menu says so: which panel it controls, and whether it is open on its room.
describe('Header: the buttons that open the menu', () => {
  it.each(['Factory', 'Atelier', 'Studio', 'Campaigns', 'About'])('%s controls the menu and is expanded while the menu shows its room', (label) => {
    nav.path = '/';
    renderWithChrome(<Header />);
    const button = screen.getByRole('button', { name: label });
    expect(button).toHaveAttribute('aria-controls', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    // the menu is open, but on another room for every other label
    const others = ['Factory', 'Atelier', 'Studio', 'Campaigns', 'About'].filter((l) => l !== label);
    for (const other of others) expect(screen.getByRole('button', { name: other })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'true');
  });
});
