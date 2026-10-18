// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
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

function Page() {
  const { closeEnquiry } = useChrome();
  return <><EnquireButton what="Jacket JK-001, original" label="Enquire about this piece" /><EnquireDialog /><button type="button" onClick={closeEnquiry}>close from outside</button></>;
}

describe('EnquireDialog', () => {
  afterEach(() => { nav.path = '/'; vi.unstubAllEnvs(); });

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
    fireEvent.click(dialog(container)); // a click on the dialog itself is a click on the backdrop
    expect(dialog(container).open).toBe(false);
    open();
    fireEvent.click(screen.getByRole('button', { name: 'close from outside' }));
    expect(dialog(container).open).toBe(false);
    open();
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
    expect(screen.getByRole('status')).toHaveTextContent('Please enter your name and a valid e-mail address.');
  });

  it('says sending is not connected yet while there is no API base', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', '');
    renderWithChrome(<Page />);
    fireEvent.click(screen.getByRole('button', { name: 'Enquire about this piece' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ada@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Sending messages is not connected yet.'));
  });

  it('starts every opening with an empty form', async () => {
    renderWithChrome(<Page />);
    const open = () => fireEvent.click(screen.getByRole('button', { name: 'Enquire about this piece' }));
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(screen.getByRole('status')).toHaveTextContent('Please enter');
    fireEvent.click(screen.getByRole('button', { name: '( Close )' }));
    open();
    await act(async () => {});
    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});
