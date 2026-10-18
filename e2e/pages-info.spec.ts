import { expect, test } from '@playwright/test';
import { gotoReady } from './ready';

test('the bag: list, quantity, remove, checkout not connected', async ({ page }) => {
  await gotoReady(page, '/atelier/scan-series/ob-011/');
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await gotoReady(page, '/bag/');
  await expect(page.locator('.bi')).toHaveCount(1);
  await page.getByRole('button', { name: 'One more' }).click();
  await expect(page.locator('.bi__q span')).toHaveText('2');
  await page.getByRole('button', { name: 'Checkout' }).click();
  // not getByRole('alert'): Next adds its own route announcer with that role
  await expect(page.locator('.sum__e')).toHaveText('Checkout is not connected yet.');
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Your bag is empty.')).toBeVisible();
});

test('a visitor with items never sees "Your bag is empty." while the bag loads', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cfc.bag.v1', JSON.stringify([{ id: 'OB-011', qty: 1, opts: {} }]));
    const w = window as unknown as { __sawEmpty: boolean };
    w.__sawEmpty = false;
    // every change of the page, from the first byte of HTML on
    new MutationObserver(() => { if (document.body?.textContent?.includes('Your bag is empty.')) w.__sawEmpty = true; })
      .observe(document, { childList: true, subtree: true, characterData: true });
  });
  await gotoReady(page, '/bag/');
  await expect(page.getByText('Your bag is empty.')).toHaveCount(0);
  await expect(page.locator('.bi')).toHaveCount(1);
  expect(await page.evaluate(() => (window as unknown as { __sawEmpty: boolean }).__sawEmpty)).toBe(false);
});

test('an empty bag says so once it has been read', async ({ page }) => {
  await gotoReady(page, '/bag/');
  await expect(page.getByText('Your bag is empty.')).toBeVisible();
  await expect(page.getByText('Loading your bag …')).toHaveCount(0);
});

test('a stored line whose product no longer exists is dropped from the bag and from the header count', async ({ page }) => {
  await gotoReady(page, '/');
  await page.evaluate(() => localStorage.setItem('cfc.bag.v1', JSON.stringify([{ id: 'OB-011', qty: 1, opts: {} }, { id: 'GONE-1', qty: 2, opts: {} }])));
  await gotoReady(page, '/bag/');
  await expect(page.locator('.bi')).toHaveCount(1);
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');
  const bag = await page.evaluate(() => JSON.parse(localStorage.getItem('cfc.bag.v1')!));
  expect(bag.map((l: { id: string }) => l.id)).toEqual(['OB-011']);
});

test('thank-you empties the bag', async ({ page }) => {
  await gotoReady(page, '/atelier/scan-series/ob-011/');
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await gotoReady(page, '/bag/thank-you/');
  await expect(page.locator('.hd__util')).toContainText('Bag ( 0 )');
});

test('Notify me preselects the subject of the contact form', async ({ page }) => {
  await gotoReady(page, '/contact/?subject=notify-furniture');
  await expect(page.getByLabel('Subject')).toHaveValue('notify');
});

test('the contact form says it is not connected yet', async ({ page }) => {
  await gotoReady(page, '/contact/');
  const form = page.locator('.cform'); // the enquiry dialog in the chrome has the same labels
  await form.getByLabel('Name').fill('A. Person');
  await form.getByLabel('E-mail').fill('a@example.com');
  await form.getByLabel('Message').fill('Hello there.');
  await form.getByRole('button', { name: 'Send' }).click();
  await expect(form.getByRole('status')).toHaveText('Sending messages is not connected yet.');
});

test('campaign 01 links Film and Behind the set as coming soon', async ({ page }) => {
  await gotoReady(page, '/campaigns/01/');
  await expect(page.locator('.linkcol .soon')).toHaveCount(2);
  await expect(page.locator('a[href*="/journal/"]')).toHaveCount(0);
});

test('about: the Bag / Profile Series text is coming soon, not a link', async ({ page }) => {
  await gotoReady(page, '/about/');
  await expect(page.locator('.register .soon')).toHaveCount(1);
  await expect(page.locator('a[href*="bag-profile-series"]')).toHaveCount(0);
});

test('the info pages answer; an unknown page is a 404 inside the site', async ({ page }) => {
  for (const path of ['/campaigns/', '/campaigns/02/', '/about/', '/shipping/', '/returns/', '/faq/', '/imprint/', '/privacy/', '/terms/']) {
    expect((await gotoReady(page, path))?.status(), path).toBe(200);
  }
  const res = await gotoReady(page, '/nowhere/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('header[data-header]')).toBeVisible();
  await expect(page.getByText('This page is drawn nowhere.')).toBeVisible();
  await expect(page.locator('.ft .tb')).toContainText('404');
});
