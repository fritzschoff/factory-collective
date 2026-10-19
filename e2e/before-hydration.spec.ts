import { expect, test, type Page } from '@playwright/test';
import { gotoReady, holdScripts } from './ready';

/** Every address the page was on: a form submitted natively would leave its fields in the query string. */
function addresses(page: Page): string[] {
  const urls: string[] = [];
  page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) urls.push(frame.url()); });
  return urls;
}

const hydrated = (page: Page) => page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

test('a product page: Add waits for hydration and adds the size and colour shown checked', async ({ page }) => {
  const urls = addresses(page);
  const release = await holdScripts(page);
  await page.goto('/atelier/fashion/sh-001/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('radio', { name: 'Chambray' }).check();
  await page.getByRole('radio', { name: '54', exact: true }).check();
  const add = page.getByRole('button', { name: 'Add to bag' });
  // a press before hydration must not send the form natively (a GET reload with ?colour=…&size=…)
  await add.click({ force: true });
  await expect(add).toBeDisabled();
  await expect(page.locator('html')).not.toHaveAttribute('data-hydrated', /.*/);

  release();
  await hydrated(page);
  await expect(page.getByRole('radio', { name: '54', exact: true })).toBeChecked();
  await expect(add).toBeEnabled();
  await add.click();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');

  await gotoReady(page, '/bag/');
  await expect(page.locator('.bi')).toHaveCount(1);
  await expect(page.locator('.bi')).toContainText('Colour: Chambray  ·  Size: 54');
  expect(urls.filter((u) => u.includes('?'))).toEqual([]);
});

test('a layer painting: a state clicked before hydration is the state Add puts in the bag', async ({ page }) => {
  const urls = addresses(page);
  const release = await holdScripts(page);
  await page.goto('/studio/layer-paintings/lp-02/', { waitUntil: 'domcontentloaded' });
  await page.locator('#states').getByText('State 03').click();
  await expect(page.locator('#states').getByRole('radio', { name: /State 03/ })).toBeChecked();
  const add = page.locator('.own__o').nth(2).getByRole('button', { name: 'Choose a state · Add' });
  await expect(add).toBeDisabled();
  await expect(page.locator('html')).not.toHaveAttribute('data-hydrated', /.*/);

  release();
  await hydrated(page);
  await expect(page.locator('#states').getByRole('radio', { name: /State 03/ })).toBeChecked();
  await add.click();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');

  await gotoReady(page, '/bag/');
  await expect(page.locator('.bi')).toHaveCount(1);
  await expect(page.locator('.bi')).toContainText('State: State 03');
  expect(urls.filter((u) => u.includes('?'))).toEqual([]);
});
