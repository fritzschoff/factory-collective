import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

function canInitializeAdmin() {
  return Boolean(PROJECT_ID && CLIENT_EMAIL && PRIVATE_KEY);
}

let cachedApp: App | null = null;

export function getFirebaseAdminApp(): App | null {
  if (!canInitializeAdmin()) {
    return null;
  }

  if (cachedApp) {
    return cachedApp;
  }

  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return existing;
  }

  cachedApp = initializeApp({
    credential: cert({
      projectId: PROJECT_ID,
      clientEmail: CLIENT_EMAIL,
      privateKey: PRIVATE_KEY!,
    }),
  });

  return cachedApp;
}

let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseAdminAuth(): Auth | null {
  if (cachedAuth) return cachedAuth;
  const app = getFirebaseAdminApp();
  if (!app) return null;
  cachedAuth = getAuth(app);
  return cachedAuth;
}

export function getFirebaseFirestore(): Firestore | null {
  if (cachedDb) return cachedDb;
  const app = getFirebaseAdminApp();
  if (!app) return null;
  cachedDb = getFirestore(app);
  return cachedDb;
}
