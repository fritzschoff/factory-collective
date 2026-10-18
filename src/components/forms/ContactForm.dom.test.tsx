// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

let query = '';
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(query) }));
import { ContactForm } from './ContactForm';

function fill() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'A. Person' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'a@example.com' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello there.' } });
}

describe('ContactForm', () => {
  afterEach(() => { query = ''; vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('preselects the subject from the query', () => {
    query = 'subject=notify-furniture';
    render(<ContactForm />);
    expect(screen.getByLabelText('Subject')).toHaveValue('notify');
  });

  it('asks for the missing fields before it sends anything', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.test');
    render(<ContactForm />);
    fireEvent.submit(screen.getByRole('button', { name: 'Send' }).closest('form')!);
    expect(screen.getByRole('status')).toHaveTextContent('Please enter your name, a valid e-mail address and a few words.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('says it is not connected yet while the API base is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', '');
    render(<ContactForm />);
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Sending messages is not connected yet.')).toBeInTheDocument();
  });

  it('ignores a second submit while the first request is on its way (Ruling P39)', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.test');
    let answer!: (r: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((r) => { answer = r; }));
    vi.stubGlobal('fetch', fetchMock);
    query = 'subject=notify-furniture';
    render(<ContactForm />);
    fill();
    const form = screen.getByRole('button', { name: 'Send' }).closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)).toMatchObject({ subject: 'notify', work: 'notify-furniture' });
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(form).toHaveAttribute('aria-busy', 'true');
    answer(new Response('{}', { status: 200 }));
    expect(await screen.findByText('Thank you. We write back within two working days.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled();
    expect(form).toHaveAttribute('aria-busy', 'false');
  });
});
