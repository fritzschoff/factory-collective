import { expect, test } from '@playwright/test';
import { gotoReady } from './ready';

test('admin is a login screen and the home page does not link to it', async ({ page }) => {
  await gotoReady(page, '/');
  await expect(page.locator('a[href="/admin/"]')).toHaveCount(0);
  const response = await gotoReady(page, '/admin/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Anmeldung|Admin/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
