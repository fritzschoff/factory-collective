import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';

export function requireAdmin(request: CallableRequest): { uid: string; email: string } {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Bitte erneut anmelden.');
  if (request.auth.token.admin !== true) throw new HttpsError('permission-denied', 'Kein Admin-Zugang.');
  return { uid: request.auth.uid, email: String(request.auth.token.email ?? '') };
}

export function withAdminClaim(current: object | undefined): Record<string, unknown> {
  return { ...(current ?? {}), admin: true };
}
