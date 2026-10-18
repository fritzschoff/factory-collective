import { expect, test } from '@playwright/test';

test('the footer names the sheet of the page and the build date', async ({ page }) => {
  await page.goto('/');
  const block = page.locator('.ft .tb');
  await expect(block).toContainText('Home');
  await expect(block).toContainText(/\d{2}\.\d{2}\.\d{4}/);
});

test('Journal is coming soon in the footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.ft').getByRole('link', { name: 'Journal' })).toHaveCount(0);
  await expect(page.locator('.ft .soon')).toContainText('Journal ( )');
});

test('the newsletter says it is not connected yet', async ({ page }) => {
  await page.goto('/');
  // Before the page has hydrated, the click submits the form natively (a GET with the address in the query) and the
  // page reloads: start again from the plain address until the message appears.
  await expect(async () => {
    if (new URL(page.url()).search) await page.goto('/');
    await page.getByPlaceholder('E-mail').fill('someone@example.com');
    await page.getByRole('button', { name: '( Subscribe )' }).click();
    await expect(page.locator('.nl__msg')).toHaveText('The newsletter is not connected yet.', { timeout: 1000 });
  }).toPass();
});
