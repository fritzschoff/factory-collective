import { expect, test } from '@playwright/test';

// the old server's values (Ruling P50); the Content-Security-Policy comes later
const SECURITY = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'SAMEORIGIN',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

for (const [what, path, status] of [
  ['the home page', '/', 200],
  ['a product page', '/atelier/fashion/sh-001/', 200],
  ['a picture', '/images/_sample/camp2/sh_grey_band.jpg', 200],
  ['an unknown address', '/nowhere/', 404],
  ['an unknown product', '/atelier/fashion/nope/', 404],
] as const) {
  test(`${what} carries the security headers and does not name the framework`, async ({ request }) => {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status()).toBe(status);
    expect(res.headers()).toMatchObject(SECURITY);
    expect(res.headers()['x-powered-by']).toBeUndefined();
  });
}
