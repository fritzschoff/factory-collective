import { expect, test } from '@playwright/test';
import { expectNotFoundPage } from './not-found';
import { gotoReady } from './ready';

test('studio: exhibitions, sound, scenography, architecture are coming soon', async ({ page }) => {
  await gotoReady(page, '/studio/');
  await expect(page.locator('.head6__r .soon')).toHaveCount(4);
  await expect(page.locator('a[href*="/studio/exhibitions/"], a[href*="/studio/sound/"]')).toHaveCount(0);
});

test('a layer painting: choose a state, add the archival print', async ({ page }) => {
  await gotoReady(page, '/studio/layer-paintings/lp-02/');
  await page.locator('#states').getByText('State 03').click();
  await page.locator('.own__o').nth(2).getByRole('button', { name: 'Choose a state · Add' }).click();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');
  const bag = await page.evaluate(() => JSON.parse(localStorage.getItem('cfc.bag.v1')!));
  expect(bag[0]).toMatchObject({ id: 'LP-02.A', opts: { state: { v: '3', l: 'State 03' } } });
});

test('a double click on Add puts the print in the bag once', async ({ page }) => {
  await gotoReady(page, '/studio/conceptual-interference/ci-07/');
  await page.locator('.own__o').nth(1).getByRole('button', { name: 'Add to bag' }).dblclick();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');
  const bag = await page.evaluate(() => JSON.parse(localStorage.getItem('cfc.bag.v1')!));
  expect(bag).toHaveLength(1);
  expect(bag[0]).toMatchObject({ id: 'CI-07.P', qty: 1 });
});

test('enquiring about an original says it is not connected yet', async ({ page }) => {
  await gotoReady(page, '/studio/conceptual-interference/ci-07/');
  await page.getByRole('button', { name: 'Enquire about the original' }).click();
  const dialog = page.getByRole('dialog', { name: 'Enquire' });
  await expect(dialog).toContainText('CI / 07 — the original');
  await dialog.getByLabel('Name').fill('A. Person');
  await dialog.getByLabel('E-mail').fill('a@example.com');
  await dialog.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(dialog.getByRole('status')).toHaveText('Sending messages is not connected yet.');
});

test('Esc closes the enquiry dialog and focus returns to the button', async ({ page }) => {
  await gotoReady(page, '/studio/layer-paintings/lp-02/');
  const button = page.getByRole('button', { name: 'Enquire about the work' });
  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Enquire' });
  await expect(dialog).toContainText('LP / 02 — the triptych');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
});

test('the series pages answer', async ({ page }) => {
  for (const path of ['/studio/conceptual-interference/', '/studio/layer-paintings/', '/studio/layer-paintings/lp-04/']) {
    expect((await gotoReady(page, path))?.status(), path).toBe(200);
  }
});

test('an unknown work is a 404 inside the site chrome, once', async ({ page }) => {
  for (const path of ['/studio/layer-paintings/lp-99/', '/studio/conceptual-interference/ci-99/']) {
    expect((await gotoReady(page, path))?.status(), path).toBe(404);
    await expectNotFoundPage(page);
  }
});
