// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithChrome } from '@/test/chrome';

const nav = vi.hoisted(() => ({ path: '/' }));
vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => nav.path }));
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
