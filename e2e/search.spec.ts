import { expect, test } from '@playwright/test';

test('slash opens the search; a code finds its piece; Enter goes there', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('/');
  const input = page.getByRole('searchbox', { name: 'Search the site' });
  await expect(input).toBeFocused();
  await input.fill('SH / 001');
  await expect(page.locator('.sres__a').first()).toContainText('SH / 001 shirt, grey band');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/atelier\/fashion\/sh-001\/$/);
});

test('nothing found says so; Esc closes', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hd__util').getByRole('button', { name: 'Search' }).click();
  await page.getByRole('searchbox', { name: 'Search the site' }).fill('zzzz');
  await expect(page.getByText('Nothing drawn under that name. ( )')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#search')).toBeHidden();
});
