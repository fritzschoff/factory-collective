// @vitest-environment jsdom
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useChrome } from '@/components/chrome/ChromeProvider';
import type { MenuEntry, MenuWorld } from '@/content/menu';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/' }));
import { MenuPanel } from './MenuPanel';

const row = (label: string, win: string[], cap = ''): MenuEntry => ({ label, href: `/atelier/${label.toLowerCase()}/`, count: null, win, cap });
const world = (id: MenuWorld['id'], label: string, own: string[]): MenuWorld => ({
  id, label, quiet: false, verb: null, line: null, enter: { label: `Enter the ${label}`, href: `/${id}/` }, win: own, cap: `the ${label}`,
  columns: [[{ head: row(label, own), note: null, items: [row('Jackets', ['/jackets-1.jpg', '/jackets-2.jpg'], 'JK / 004')] }]],
});
const WORLDS = [world('factory', 'Factory', ['/factory-1.jpg']), world('atelier', 'Atelier', ['/atelier-1.jpg'])];

/** Stands in for the header's Menu button. */
function Open() {
  const { openMenu } = useChrome();
  return <button type="button" onClick={() => openMenu('atelier')}>open</button>;
}

const show = () => renderWithChrome(<><Open /><MenuPanel worlds={WORLDS} /></>);
/** The files in the window of the Atelier panel (jsdom writes url("…") with quotes). */
const pictures = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>('#mp-atelier .bwin__img')].map((e) => e.style.backgroundImage.replace(/^url\("?|"?\)$/g, ''));

describe('MenuPanel: the window', () => {
  it('loads no pictures while the menu is closed, the room\'s own once it is open', () => {
    const { container } = show();
    expect(pictures(container)).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    expect(pictures(container)).toEqual(['/atelier-1.jpg']);
  });

  it('shows the pictures and the name of the row under the pointer, and the room\'s own again when it leaves', () => {
    const { container } = show();
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    const panel = container.querySelector<HTMLElement>('#mp-atelier')!;
    fireEvent.mouseOver(within(panel).getByRole('link', { name: 'Jackets' }));
    expect(pictures(container)).toEqual(['/jackets-1.jpg', '/jackets-2.jpg']);
    expect(panel.querySelector('.mp__ft')).toHaveTextContent('Atelier / Jackets');
    fireEvent.mouseOut(panel);
    expect(pictures(container)).toEqual(['/atelier-1.jpg']);
  });

  it('forgets the row that was hovered when the menu closes: it opens again on the room\'s own pictures', () => {
    const { container } = show();
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    const panel = container.querySelector<HTMLElement>('#mp-atelier')!;
    // keyboard focus, not the pointer, so no mouse-leave ever clears it
    fireEvent.focus(within(panel).getByRole('link', { name: 'Jackets' }));
    expect(panel.querySelector('.mp__ft')).toHaveTextContent('Atelier / Jackets');
    fireEvent.click(screen.getByRole('button', { name: '( Close )' }));
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    expect(pictures(container)).toEqual(['/atelier-1.jpg']);
    expect(panel.querySelector('.mp__ft')).toHaveTextContent('');
    expect(panel.querySelector('.mp__fc')).toHaveTextContent('the Atelier');
  });
});
