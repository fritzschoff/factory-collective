/** Calls of the Firebase Functions (Phase 2). Until NEXT_PUBLIC_API_BASE is set, every call says so politely. */
export type ApiName = 'checkout' | 'enquire' | 'newsletter';

const WHAT: Record<ApiName, string> = { checkout: 'Checkout', enquire: 'Sending messages', newsletter: 'The newsletter' };

export class ApiNotConnectedError extends Error {
  constructor(what: string) {
    super(`${what} is not connected yet.`);
    this.name = 'ApiNotConnectedError';
  }
}

export const apiBase = (): string | null => (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/$/, '') || null;

export async function postApi<T = unknown>(name: ApiName, body: unknown): Promise<T> {
  const base = apiBase();
  if (!base) throw new ApiNotConnectedError(WHAT[name]);
  let res: Response;
  try {
    res = await fetch(`${base}/${name}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new Error('No connection. Please try again in a moment.');
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data as T;
}
