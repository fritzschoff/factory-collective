import { expect, test } from '@playwright/test';
import { gotoReady } from './ready';

test('a text keeps row 03 coming soon, and the theses name the works they bind', async ({ page }) => {
  await gotoReady(page, '/factory/tectonics-without-origin/');
  const row = page.locator('.rows__r').filter({ hasText: 'Bag / Profile Series' });
  await expect(row).toContainText('03');
  await expect(row).toHaveClass(/is-red/);
  await expect(row.getByRole('link')).toHaveCount(0);
  await gotoReady(page, '/factory/');
  await expect(page.locator('#t01')).toContainText('// profile');
  await expect(page.locator('#t02')).toContainText('// ordinary object');
  await expect(page.locator('#theses .thesis.is-red')).toHaveCount(2);
  await expect(page.locator('.tile--idx', { hasText: 'JK / 001' })).toContainText('Thesis T01');
  await expect(page.locator('.tile--idx', { hasText: 'OB / 011' })).toContainText('Thesis T02');
});

test('factory: text 03, theses T03 / T04 and three side rooms are coming soon', async ({ page }) => {
  await page.goto('/factory/');
  await expect(page.getByRole('heading', { level: 1, name: 'Factory' })).toBeVisible();
  await expect(page.locator('.rows__r.is-red')).toContainText('Bag / Profile Series');
  await expect(page.locator('#theses .thesis.is-red .soon')).toHaveCount(2);
  await expect(page.locator('.linkrow .soon')).toHaveCount(3);
  await expect(page.locator('a[href*="bag-profile-series"]')).toHaveCount(0);
});

test('factory: the Menu button opens the Factory room', async ({ page }) => {
  await gotoReady(page, '/factory/');
  const menu = page.locator('#menu');
  await page.locator('.hd__util').getByRole('button', { name: 'Menu' }).click();
  await expect(menu).toHaveClass(/is-open/);
  await expect(menu.getByRole('tab', { name: 'Factory' })).toHaveAttribute('aria-selected', 'true');
});

test('T01 adds a piece from its list', async ({ page }) => {
  await gotoReady(page, '/factory/tectonics-without-origin/');
  const add = page.locator('.tile--idx').first().getByRole('button', { name: 'Add' });
  // Any scroll closes the option box. Playwright scrolls the tile into view and clicks in the same frame, so the
  // scroll event of that jump would arrive after the box has opened and close it again: let the event pass first.
  await add.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await add.click();
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');
});

test('T02 and the glossary answer', async ({ page }) => {
  for (const path of ['/factory/ordinary-objects/', '/factory/glossary/']) {
    expect((await page.goto(path))?.status(), path).toBe(200);
  }
});
