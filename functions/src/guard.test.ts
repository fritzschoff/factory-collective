import { HttpsError } from 'firebase-functions/v2/https';
import { describe, expect, it } from 'vitest';
import { requireAdmin, withAdminClaim } from './guard';

describe('admin guard', () => {
  it('keeps existing claims and sets admin', () => {
    expect(withAdminClaim({ role: 'editor' })).toEqual({ role: 'editor', admin: true });
    expect(withAdminClaim(undefined)).toEqual({ admin: true });
  });

  it('refuses a signed-in account without the claim', () => {
    const request = { auth: { uid: 'a', token: { admin: false, email: 'a@b.de' } }, data: {} } as never;
    expect(() => requireAdmin(request)).toThrow(HttpsError);
    try { requireAdmin(request); } catch (error) {
      expect(error).toMatchObject({ code: 'permission-denied' });
    }
  });

  it('asks a signed-out visitor to sign in again', () => {
    expect(() => requireAdmin({ data: {} } as never)).toThrow(/erneut anmelden/);
  });
});
