import { httpsCallable } from 'firebase/functions';
import { firebaseFunctions } from '@/lib/firebase-client';

export async function adminCall<T>(name: string, data?: object): Promise<T> {
  const functions = firebaseFunctions();
  if (!functions) throw new Error('Firebase ist nicht konfiguriert.');
  const result = await httpsCallable(functions, name)(data ?? {});
  return result.data as T;
}

export function adminError(error: unknown): { message: string; fields: Record<string, string> } {
  if (error && typeof error === 'object') {
    const row = error as { message?: unknown; details?: { fields?: Record<string, string> } };
    return {
      message: typeof row.message === 'string' && row.message ? row.message : 'Das hat nicht geklappt.',
      fields: row.details?.fields ?? {},
    };
  }
  return { message: 'Das hat nicht geklappt.', fields: {} };
}
