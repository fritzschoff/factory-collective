import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiNotConnectedError, postApi } from './api';

describe('postApi', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('says the function is not connected while there is no API base', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', '');
    await expect(postApi('checkout', {})).rejects.toThrow(new ApiNotConnectedError('Checkout'));
    await expect(postApi('checkout', {})).rejects.toThrow('Checkout is not connected yet.');
  });

  it('posts JSON to <base>/<name> and returns the answer', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example/');
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(postApi('newsletter', { email: 'a@b.de' })).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('https://api.example/newsletter', expect.objectContaining({ method: 'POST', body: '{"email":"a@b.de"}' }));
  });

  it('passes on the error message of the function', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'Your bag is empty.' }), { status: 400 })));
    await expect(postApi('checkout', {})).rejects.toThrow('Your bag is empty.');
  });

  it('a network failure becomes a plain sentence', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed'); }));
    await expect(postApi('enquire', {})).rejects.toThrow('No connection. Please try again in a moment.');
  });
});
