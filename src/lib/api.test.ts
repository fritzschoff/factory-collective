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

  it('does not turn an error object into [object Object], and an empty success is a failure', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: { code: 1 } }), { status: 400 })));
    await expect(postApi('checkout', {})).rejects.toThrow('Something went wrong. Please try again.');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 200 })));
    await expect(postApi('newsletter', {})).rejects.toThrow('Something went wrong. Please try again.');
  });

  it('a network failure becomes a plain sentence', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed'); }));
    await expect(postApi('enquire', {})).rejects.toThrow('No connection. Please try again in a moment.');
  });

  // AbortSignal.timeout runs on Node's own timers, which fake timers do not reach: the test hands out a signal it controls
  function stalledSignal() {
    const controller = new AbortController();
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
    const stop = () => controller.abort(new DOMException('The operation timed out.', 'TimeoutError'));
    return { timeout, stop };
  }
  const whenAborted = (signal: AbortSignal) => new Promise<never>((_, reject) => signal.addEventListener('abort', () => reject(signal.reason)));

  it('gives up after 15 seconds and says there is no connection', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    const { timeout, stop } = stalledSignal();
    const fetchMock = vi.fn((_url: string, init: RequestInit) => whenAborted(init.signal!));
    vi.stubGlobal('fetch', fetchMock);
    const pending = postApi('enquire', {});
    const settled = expect(pending).rejects.toThrow('No connection. Please try again in a moment.');
    expect(timeout).toHaveBeenCalledWith(15000);
    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    stop();
    await settled;
  });

  it('a body that stalls after the headers also ends in the same sentence, not in an empty answer', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    const { stop } = stalledSignal();
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => ({ ok: true, json: () => whenAborted(init.signal!) })));
    const settled = expect(postApi('newsletter', {})).rejects.toThrow('No connection. Please try again in a moment.');
    await Promise.resolve();
    stop();
    await settled;
  });
});
