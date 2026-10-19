import { expect, test, type Page } from '@playwright/test';

/**
 * The shortcut listener is attached when the page hydrates, which can come after the load event (above all on a cold
 * server): press `/` until the search has taken focus instead of guessing how long to wait.
 */
async function openWithSlash(page: Page) {
  const input = page.getByRole('combobox', { name: 'Search the site' });
  await expect(async () => {
    await page.keyboard.press('/');
    await expect(input).toBeFocused({ timeout: 500 });
  }).toPass();
  return input;
}

test('control k opens the search from another room', async ({ page }) => {
  await page.goto('/factory/');
  const input = page.getByRole('combobox', { name: 'Search the site' });
  await expect(async () => {
    await page.keyboard.press('Control+k');
    await expect(input).toBeFocused({ timeout: 500 });
  }).toPass();
});

test('slash opens the search; a code finds its piece; Enter goes there', async ({ page }) => {
  await page.goto('/');
  const input = await openWithSlash(page);
  await input.fill('SH / 001');
  await expect(page.locator('.sres__a').first()).toContainText('SH / 001 shirt, grey band');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/atelier\/fashion\/sh-001\/$/);
});

test('nothing found says so; Esc closes', async ({ page }) => {
  await page.goto('/');
  // the button does nothing until the page has hydrated: click until the search is open (an open search covers it)
  const input = page.getByRole('combobox', { name: 'Search the site' });
  await expect(async () => {
    if (!(await input.isVisible())) await page.locator('.hd__util').getByRole('button', { name: 'Search' }).click({ timeout: 1000 });
    await expect(input).toBeFocused({ timeout: 500 });
  }).toPass();
  await input.fill('zzzz');
  await expect(page.getByText('Nothing drawn under that name. ( )')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#search')).toBeHidden();
});

test('the arrow keys keep the selected row in view, however far down the list goes', async ({ page }) => {
  await page.goto('/');
  const input = await openWithSlash(page);
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
