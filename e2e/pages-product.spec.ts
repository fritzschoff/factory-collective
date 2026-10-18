import { expect, test } from '@playwright/test';

test('a product page: gallery, size guide, add to bag', async ({ page }) => {
  await page.goto('/atelier/fashion/sh-001/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('SH / 001');
  await page.getByRole('tab', { name: 'Picture 2' }).click();
  await expect(page.locator('.gal__i.is-on')).toHaveCount(1);
  await expect(page.locator('.gal__n')).toHaveText('2 of 4');
  await page.getByRole('link', { name: /Size guide/ }).click();
  await expect(page.locator('#acc-measurements')).toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');
});

test('bags point to their unwritten text as coming soon', async ({ page }) => {
  await page.goto('/atelier/bags/bg-114/');
  await expect(page.locator('.acc .soon')).toContainText('Bag / Profile Series — the text');
  await expect(page.getByRole('link', { name: /the text/ })).toHaveCount(0);
});

test('every series page answers', async ({ page }) => {
  for (const path of ['/atelier/bags/', '/atelier/jewellery/', '/atelier/scan-series/', '/atelier/jewellery/br-a/', '/atelier/scan-series/ob-011/']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  }
});

test('an unknown product is a 404', async ({ page }) => {
  const res = await page.goto('/atelier/fashion/nope/');
  expect(res?.status()).toBe(404);
});
