import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { withAdminClaim } from '../functions/src/guard';

function envFile(name: string): string {
  if (!existsSync('.env.local')) return '';
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    if (!line.startsWith(`${name}=`)) continue;
    return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

function initAdmin(): void {
  if (getApps().length) return;
  const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || envFile('FIREBASE_PROJECT_ID') || envFile('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || 'demo-cfc';
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST) {
    initializeApp({ projectId });
    return;
  }
  initializeApp(keyFile ? { credential: cert(JSON.parse(readFileSync(keyFile, 'utf8'))), projectId } : { credential: applicationDefault(), projectId });
}

async function main(): Promise<void> {
  const email = (process.argv[2] ?? '').trim();
  if (!email) {
    console.error('Usage: npm run admin:add -- <email>');
    process.exit(1);
  }
  initAdmin();
  const user = await getAuth().getUserByEmail(email);
  await getAuth().setCustomUserClaims(user.uid, withAdminClaim(user.customClaims));
  console.log(`Admin claim set. The account must sign in again before it applies.`);
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isDirect) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
