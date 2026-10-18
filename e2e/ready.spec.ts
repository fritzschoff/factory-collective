import { expect, test } from '@playwright/test';
import { gotoReady } from './ready';

test('the hydration marker is not in the server HTML; it is set once the page has hydrated', async ({ page, request }) => {
  const html = await (await request.get('/studio/')).text();
  expect(html).not.toContain('data-hydrated');
  await gotoReady(page, '/studio/');
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', '1');
});

test('without its scripts a page is not marked as hydrated', async ({ page }) => {
  await page.route('**/_next/static/**/*.js', (route) => route.abort());
  await page.goto('/studio/');
  await expect(page.getByRole('heading', { level: 1, name: 'Studio' })).toBeVisible();
  await expect(page.locator('html')).not.toHaveAttribute('data-hydrated', /.*/);
});
