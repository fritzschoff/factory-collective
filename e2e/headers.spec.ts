import { expect, test } from '@playwright/test';

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
    const policy = res.headers()['content-security-policy-report-only'];
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("frame-ancestors 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain('https://firebasestorage.googleapis.com');
    expect(policy).toContain('https://*.cloudfunctions.net');
    expect(policy).not.toContain('unsafe-inline');
    expect(res.headers()['content-security-policy']).toBeUndefined();
  });
}

test('a coming-soon redirect does not carry the security headers', async ({ request }) => {
  const res = await request.get('/press/', { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()['content-security-policy-report-only']).toBeUndefined();
  expect(res.headers()['x-content-type-options']).toBeUndefined();
});
