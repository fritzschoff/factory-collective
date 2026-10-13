import { expect, test } from '@playwright/test';
import { soonRedirects } from '../src/content/soon';

for (const r of soonRedirects()) {
  test(`${r.source} redirects temporarily to ${r.destination}`, async ({ request }) => {
    const res = await request.get(r.source, { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(new URL(res.headers()['location'], 'http://x').pathname).toBe(r.destination);
  });

  test(`${r.source.slice(0, -1)} without the slash also ends on ${r.destination}`, async ({ request }) => {
    const res = await request.get(r.source.slice(0, -1));
    expect(new URL(res.url()).pathname).toBe(r.destination);
  });
}
