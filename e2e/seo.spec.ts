import { expect, test } from '@playwright/test';

test('robots.txt keeps the bag and the admin out', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text();
  expect(txt).toContain('Disallow: /bag/');
  expect(txt).toContain('Disallow: /admin/');
  expect(txt).toContain('Sitemap: http://localhost:3000/sitemap.xml');
});

test('the sitemap lists the pages and no coming-soon address', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('<loc>http://localhost:3000/atelier/fashion/sh-001/</loc>');
  expect(xml).not.toContain('/furniture/');
  expect(xml).not.toContain('/bag/');
  expect(xml.match(/<loc>/g)).toHaveLength(85);
});
