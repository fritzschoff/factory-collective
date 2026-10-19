import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';

let authEmulatorReady = false;
let functionsEmulatorReady = false;

function config() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '';
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '';
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '';
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '';
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '';
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '';
  if (!apiKey || !projectId || !appId) return null;
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

export function firebaseConfigured(): boolean {
  return config() != null;
}

function app(): FirebaseApp | null {
  const values = config();
  if (!values) return null;
  return getApps().length ? getApp() : initializeApp(values);
}

export function firebaseAuth(): Auth | null {
  const ready = app();
  if (!ready) return null;
  const auth = getAuth(ready);
  attachEmulators(auth, null);
  return auth;
}

export function firebaseFunctions(): Functions | null {
  const ready = app();
  if (!ready) return null;
  const functions = getFunctions(ready, 'europe-west3');
  attachEmulators(null, functions);
  return functions;
}

function attachEmulators(auth: Auth | null, functions: Functions | null): void {
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR !== '1' || typeof window === 'undefined') return;
  if (auth && !authEmulatorReady) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    authEmulatorReady = true;
  }
  if (functions && !functionsEmulatorReady) {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    functionsEmulatorReady = true;
  }
}
