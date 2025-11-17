import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function hasClientConfig() {
  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.appId
  );
}

export function getFirebaseClientApp(): FirebaseApp | null {
  if (!hasClientConfig()) {
    console.warn("Missing Firebase client configuration; auth is disabled.");
    return null;
  }

  if (getApps().length) {
    return getApp();
  }

  return initializeApp(config);
}

let cachedAuth: Auth | null = null;

export function getFirebaseClientAuth(): Auth | null {
  if (cachedAuth) return cachedAuth;
  const app = getFirebaseClientApp();
  if (!app) return null;
  cachedAuth = getAuth(app);
  return cachedAuth;
}
