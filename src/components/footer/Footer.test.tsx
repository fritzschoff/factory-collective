// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithChrome } from '@/test/chrome';

// `pending` makes the address suspend, as it does under cacheComponents on a route whose params are not known at build time
const nav = vi.hoisted(() => ({ path: '/', pending: false, never: new Promise<string>(() => {}) }));
vi.mock('next/navigation', async (importOriginal) => {
  const { use } = await import('react');
  return { ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => (nav.pending ? use(nav.never) : nav.path) };
});
import { Footer } from './Footer';

const SHEETS = { '/': 'Home', '/atelier/fashion/': 'Atelier / Fashion' };

describe('Footer', () => {
  afterEach(() => { nav.path = '/'; nav.pending = false; vi.unstubAllEnvs(); });

  it('names the sheet of the page in the title block', () => {
    nav.path = '/atelier/fashion/';
    const { container } = renderWithChrome(<Footer sheets={SHEETS} />);
    expect(container.querySelector('.tb')).toHaveTextContent('Atelier / Fashion');
  });

  it('finds the sheet of an address without its trailing slash', () => {
    nav.path = '/atelier/fashion';
    const { container } = renderWithChrome(<Footer sheets={SHEETS} />);
    expect(container.querySelector('.tb')).toHaveTextContent('Atelier / Fashion');
  });

  it('shows Journal as coming soon, never as a link', () => {
    const { container } = renderWithChrome(<Footer sheets={SHEETS} />);
    expect(screen.queryByRole('link', { name: /Journal/ })).toBeNull();
    expect(container.querySelector('.ft .soon')).toHaveTextContent('Journal ( )');
  });

  it('opens other sites in a new tab and keeps the rest in the site', () => {
    renderWithChrome(<Footer sheets={SHEETS} />);
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Imprint' })).not.toHaveAttribute('target');
  });

  it('stays on show while the address is pending: only the sheet name waits', async () => {
    nav.pending = true;
    const { container } = renderWithChrome(<Footer sheets={SHEETS} />);
    await act(async () => {});
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument();
    expect(container.querySelector('.tb')).toHaveTextContent('English');
  });

  it('says what is not the real thing yet in the last line', () => {
    vi.stubEnv('DEMO_PRICES', '1');
    const { container } = renderWithChrome(<Footer sheets={SHEETS} />);
    expect(container.querySelector('.ft__c2')).toHaveTextContent('demo prices');
  });
});

describe('Newsletter form', () => {
  afterEach(() => { vi.unstubAllEnvs(); });

  it('asks for a valid address before it sends anything', () => {
    renderWithChrome(<Footer sheets={SHEETS} />);
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'nobody' } });
    fireEvent.click(screen.getByRole('button', { name: '( Subscribe )' }));
    expect(screen.getByRole('status')).toHaveTextContent('Please enter a valid e-mail address.');
  });

  it('says it is not connected yet while there is no API base', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', '');
    renderWithChrome(<Footer sheets={SHEETS} />);
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'someone@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: '( Subscribe )' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('The newsletter is not connected yet.'));
  });
});
