// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
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
/** The message line of the newsletter form — the toast of the chrome is a status region as well. */
const message = () => within(document.querySelector<HTMLElement>('form.nl')!).getByRole('status');

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

  it('names an address that no page answers "404"', () => {
    nav.path = '/nowhere/';
    const { container } = renderWithChrome(<Footer sheets={SHEETS} />);
    expect(container.querySelector('.tb')).toHaveTextContent('404');
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
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('asks for a valid address before it sends anything', () => {
    renderWithChrome(<Footer sheets={SHEETS} />);
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'nobody' } });
    fireEvent.click(screen.getByRole('button', { name: '( Subscribe )' }));
    expect(message()).toHaveTextContent('Please enter a valid e-mail address.');
  });

  it('says it is not connected yet while there is no API base', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', '');
    renderWithChrome(<Footer sheets={SHEETS} />);
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'someone@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: '( Subscribe )' }));
    await waitFor(() => expect(message()).toHaveTextContent('The newsletter is not connected yet.'));
  });

  it('ignores a second submit while the first is on its way, then takes the next one', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    let answer!: (r: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { answer = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderWithChrome(<Footer sheets={SHEETS} />);
    const form = container.querySelector('form.nl') as HTMLFormElement;
    const button = screen.getByRole('button', { name: '( Subscribe )' });
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'someone@example.com' } });
    fireEvent.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    expect(form).toHaveAttribute('aria-busy', 'true');
    fireEvent.submit(form); // Enter in the field, or a click that got through
    fireEvent.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => { answer(new Response(JSON.stringify({ ok: true }), { status: 200 })); });
    expect(message()).toHaveTextContent('Subscribed. One letter a month.');
    expect(button).toBeEnabled();
    expect(form).toHaveAttribute('aria-busy', 'false');
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'again@example.com' } });
    fireEvent.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => { answer(new Response(JSON.stringify({ ok: true }), { status: 200 })); });
  });

  it('opens the button again when the request fails', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed'); }));
    renderWithChrome(<Footer sheets={SHEETS} />);
    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'someone@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: '( Subscribe )' }));
    await waitFor(() => expect(message()).toHaveTextContent('No connection. Please try again in a moment.'));
    expect(screen.getByRole('button', { name: '( Subscribe )' })).toBeEnabled();
  });
});
