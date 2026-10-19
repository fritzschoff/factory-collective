// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ChromeProvider, useChrome } from '@/components/chrome/ChromeProvider';
import { renderWithChrome } from '@/test/chrome';
import { EnquireButton } from './EnquireButton';
import { EnquireDialog } from './EnquireDialog';

const nav = vi.hoisted(() => ({ path: '/' }));
vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => nav.path }));

// jsdom has no modal <dialog>: this stands in for the part of it that the component uses
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

const dialog = (container: HTMLElement) => container.querySelector('dialog') as HTMLDialogElement;
/** The message line of the enquiry form — the toast of the chrome is a status region as well. */
const message = () => within(document.querySelector<HTMLElement>('form.dlg__f')!).getByRole('status');

function Page() {
  const { closeEnquiry } = useChrome();
  return <><EnquireButton what="Jacket JK-001, original" label="Enquire about this piece" /><EnquireDialog /><button type="button" onClick={closeEnquiry}>close from outside</button></>;
}

describe('EnquireDialog', () => {
  afterEach(() => { nav.path = '/'; vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('is shut until a button asks, then names the work', () => {
    const { container } = renderWithChrome(<Page />);
    expect(dialog(container).open).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Enquire about this piece' }));
    expect(dialog(container).open).toBe(true);
    expect(dialog(container)).toHaveTextContent('Jacket JK-001, original');
  });

  it('closes with ( Close ), with the backdrop and from outside, and opens again', () => {
    const { container } = renderWithChrome(<Page />);
    const open = () => fireEvent.click(screen.getByRole('button', { name: 'Enquire about this piece' }));
    open();
    fireEvent.click(screen.getByRole('button', { name: '( Close )' }));
    expect(dialog(container).open).toBe(false);
    open();
    fireEvent.mouseDown(dialog(container));
    fireEvent.click(dialog(container));
    expect(dialog(container).open).toBe(false);
    open();
    fireEvent.click(screen.getByRole('button', { name: 'close from outside' }));
    expect(dialog(container).open).toBe(false);
    open();
    expect(dialog(container).open).toBe(true);
  });

  it('stays open when a text selection ends on the backdrop', () => {
    const { container } = renderWithChrome(<Page />);
    fireEvent.click(screen.getByRole('button', { name: 'Enquire about this piece' }));
    fireEvent.mouseDown(screen.getByRole('textbox', { name: 'Message' }));
    fireEvent.click(dialog(container));
    expect(dialog(container).open).toBe(true);
  });

  it('closes when the page changes', () => {
    const { container, rerender } = renderWithChrome(<Page />);
    fireEvent.click(screen.getByRole('button', { name: 'Enquire about this piece' }));
    expect(dialog(container).open).toBe(true);
    nav.path = '/atelier/';
    rerender(<ChromeProvider><Page /></ChromeProvider>);
    expect(dialog(container).open).toBe(false);
  });

  it('asks for name and address before it sends anything', () => {
    renderWithChrome(<Page />);
    fireEvent.click(screen.getByRole('button', { name: 'Enquire about this piece' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(message()).toHaveTextContent('Please enter your name and a valid e-mail address.');
  });

  it('says sending is not connected yet while there is no API base', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', '');
    renderWithChrome(<Page />);
    fireEvent.click(screen.getByRole('button', { name: 'Enquire about this piece' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ada@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    await waitFor(() => expect(message()).toHaveTextContent('Sending messages is not connected yet.'));
  });

  it('starts every opening with an empty form', async () => {
    renderWithChrome(<Page />);
    const open = () => fireEvent.click(screen.getByRole('button', { name: 'Enquire about this piece' }));
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(message()).toHaveTextContent('Please enter');
    fireEvent.click(screen.getByRole('button', { name: '( Close )' }));
    open();
    await act(async () => {});
    expect(message()).toHaveTextContent('');
  });

  it('ignores a second submit while the first is on its way, then takes the next one', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    let answer!: (r: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { answer = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderWithChrome(<Page />);
    fireEvent.click(screen.getByRole('button', { name: 'Enquire about this piece' }));
    const form = container.querySelector('form.dlg__f') as HTMLFormElement;
    const send = screen.getByRole('button', { name: 'Send enquiry' });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ada@example.com' } });
    fireEvent.click(send);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(send).toBeDisabled();
    expect(form).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: '( Close )' })).toBeEnabled(); // closing stays possible
    fireEvent.submit(form);
    fireEvent.click(send);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => { answer(new Response(JSON.stringify({ ok: true }), { status: 200 })); });
    expect(message()).toHaveTextContent('Thank you. We write back within two working days.');
    expect(send).toBeEnabled();
    expect(form).toHaveAttribute('aria-busy', 'false');
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ada@example.com' } });
    fireEvent.click(send);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => { answer(new Response(JSON.stringify({ ok: true }), { status: 200 })); });
  });

  it('opens the button again when the request fails', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed'); }));
    renderWithChrome(<Page />);
    fireEvent.click(screen.getByRole('button', { name: 'Enquire about this piece' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ada@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    await waitFor(() => expect(message()).toHaveTextContent('No connection. Please try again in a moment.'));
    expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeEnabled();
  });
});
