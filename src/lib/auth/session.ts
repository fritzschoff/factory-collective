import type { SessionUser } from '@/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getFirebaseAdminAuth } from '../firebase-admin';

export const SESSION_COOKIE_NAME = 'fc_session';

export async function getCurrentUser(): Promise<SessionUser | null> {
  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = await auth.verifySessionCookie(token, true);
    return {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name,
      photoURL: decoded.picture,
    } satisfies SessionUser;
  } catch (error) {
    console.warn('Invalid Firebase session cookie', error);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
