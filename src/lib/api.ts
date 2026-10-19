/** Calls of the Firebase Functions. Until NEXT_PUBLIC_API_BASE is set, every call says so politely. */
export type ApiName = 'checkout' | 'enquire' | 'newsletter' | 'catalog' | 'availability' | 'order';

const WHAT: Record<ApiName, string> = {
  checkout: 'Checkout', enquire: 'Sending messages', newsletter: 'The newsletter',
  catalog: 'The catalogue', availability: 'Availability', order: 'The order',
};

export class ApiNotConnectedError extends Error {
  constructor(what: string) {
    super(`${what} is not connected yet.`);
    this.name = 'ApiNotConnectedError';
  }
}

export class ApiError extends Error {
  constructor(message: string, readonly rejected: { id: string; reason: string; available?: number }[] = []) {
    super(message);
    this.name = 'ApiError';
  }
}

const TIMEOUT_MS = 15_000;
const NO_CONNECTION = 'No connection. Please try again in a moment.';
const WENT_WRONG = 'Something went wrong. Please try again.';

export const apiBase = (): string | null => (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/$/, '') || null;

function errorMessage(data: unknown): string {
  if (!data || typeof data !== 'object' || !('error' in data)) return WENT_WRONG;
  const error = (data as { error: unknown }).error;
  return typeof error === 'string' && error ? error : WENT_WRONG;
}

function rejectedOf(data: unknown): { id: string; reason: string; available?: number }[] {
  if (!data || typeof data !== 'object' || !('rejected' in data)) return [];
  const rejected = (data as { rejected: unknown }).rejected;
  if (!Array.isArray(rejected)) return [];
  return rejected.flatMap((item) => {
    if (!item || typeof item !== 'object' || typeof (item as { id?: unknown }).id !== 'string') return [];
    const row = item as { id: string; reason?: unknown; available?: unknown };
    return [{ id: row.id, reason: typeof row.reason === 'string' ? row.reason : '', available: typeof row.available === 'number' ? row.available : undefined }];
  });
}

async function readBody(res: Response, signal: AbortSignal): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    if (signal.aborted) throw new Error(NO_CONNECTION);
    throw new Error(WENT_WRONG);
  }
}

export async function postApi<T = unknown>(name: ApiName, body: unknown, init?: { idempotencyKey?: string }): Promise<T> {
  const base = apiBase();
  if (!base) throw new ApiNotConnectedError(WHAT[name]);
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (init?.idempotencyKey) headers['idempotency-key'] = init.idempotencyKey;
  let res: Response;
  try {
    res = await fetch(`${base}/${name}`, { method: 'POST', headers, body: JSON.stringify(body), signal });
  } catch {
    throw new Error(NO_CONNECTION);
  }
  const data = await readBody(res, signal);
  if (!res.ok) throw new ApiError(errorMessage(data), rejectedOf(data));
  if (!data || typeof data !== 'object') throw new Error(WENT_WRONG);
  return data as T;
}

export async function getApi<T = unknown>(name: ApiName, query?: Record<string, string>): Promise<T> {
  const base = apiBase();
  if (!base) throw new ApiNotConnectedError(WHAT[name]);
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const url = new URL(`${base}/${name}`);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);
  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch {
    throw new Error(NO_CONNECTION);
  }
  const data = await readBody(res, signal);
  if (!res.ok) throw new ApiError(errorMessage(data));
  if (!data || typeof data !== 'object') throw new Error(WENT_WRONG);
  return data as T;
}

const flights = new Map<string, Promise<unknown>>();

export function submitOnce<T>(scope: string, run: (idempotencyKey: string) => Promise<T>): Promise<T> {
  const existing = flights.get(scope) as Promise<T> | undefined;
  if (existing) return existing;
  const pending = run(crypto.randomUUID()).finally(() => {
    if (flights.get(scope) === pending) flights.delete(scope);
  });
  flights.set(scope, pending);
  return pending;
}
