import { readFileSync, writeFileSync, existsSync } from 'node:fs';

function fromFile(name) {
  if (!existsSync('.env.local')) return '';
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    if (!line.startsWith(`${name}=`)) continue;
    return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

const id = process.env.FIREBASE_PROJECT_ID || fromFile('FIREBASE_PROJECT_ID') || fromFile('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || 'demo-cfc';
if (process.argv.includes('--require-project') && id === 'demo-cfc') {
  console.error('Set FIREBASE_PROJECT_ID in the environment or .env.local before deploying.');
  process.exit(1);
}
writeFileSync('.firebaserc', `${JSON.stringify({ projects: { default: id } }, null, 2)}\n`);
