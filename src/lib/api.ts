/** Calls of the Firebase Functions (Phase 2). Until NEXT_PUBLIC_API_BASE is set, every call says so politely. */
export type ApiName = 'checkout' | 'enquire' | 'newsletter';

const WHAT: Record<ApiName, string> = { checkout: 'Checkout', enquire: 'Sending messages', newsletter: 'The newsletter' };

export class ApiNotConnectedError extends Error {
  constructor(what: string) {
    super(`${what} is not connected yet.`);
    this.name = 'ApiNotConnectedError';
  }
}

/** A request that has not been answered after this long is given up. */
const TIMEOUT_MS = 15_000;
const NO_CONNECTION = 'No connection. Please try again in a moment.';

export const apiBase = (): string | null => (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/$/, '') || null;

export async function postApi<T = unknown>(name: ApiName, body: unknown): Promise<T> {
  const base = apiBase();
  if (!base) throw new ApiNotConnectedError(WHAT[name]);
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${base}/${name}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal });
  } catch {
    throw new Error(NO_CONNECTION);
  }
  // the timeout also covers the body: one that stalls after the headers is no empty answer
  let data: { error?: string } = {};
  try {
    data = (await res.json()) as { error?: string };
  } catch {
    if (signal.aborted) throw new Error(NO_CONNECTION);
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data as T;
}
