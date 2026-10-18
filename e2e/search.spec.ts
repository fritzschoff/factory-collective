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

test('the arrow keys keep the selected row in view, however far down the list goes', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('/');
  const input = page.getByRole('searchbox', { name: 'Search the site' });
  await input.fill('fashion');
  // more rows than fit the window: the list scrolls inside the search
  const rows = page.locator('.sres__a');
  expect(await rows.count()).toBeGreaterThan(14);
  for (let i = 0; i < 14; i++) await page.keyboard.press('ArrowDown');
  await expect(page.locator('.sres__a.is-sel')).toBeInViewport({ ratio: 1 });
  // the 14th key is the 14th row (index 13): 13 steps up reach the first row, one more wraps round to the last
  for (let i = 0; i < 14; i++) await page.keyboard.press('ArrowUp');
  await expect(page.locator('.sres__a.is-sel')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('.sres__a.is-sel')).toHaveAttribute('href', (await rows.last().getAttribute('href'))!);
});
