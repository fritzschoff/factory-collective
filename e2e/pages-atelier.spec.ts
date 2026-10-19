import { expect, test } from '@playwright/test';
import { gotoReady } from './ready';

test('home shows the campaign, four fashion pieces and the rooms', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Eighteen pieces, cut like a section.')).toBeVisible();
  await expect(page.locator('.home__tiles .tile')).toHaveCount(4);
  // bags head: "Read the text" twice · studio head: Scenography
  await expect(page.locator('.sech .soon')).toHaveCount(3);
});

test('the home page has one h1, the name of the collective, for search engines and screen readers', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Concept. ( ) Collective');
  await expect(page.locator('h1')).toHaveClass('sr');
});

test('quick add from a home tile fills the bag', async ({ page }) => {
  await gotoReady(page, '/');
  const add = page.locator('.home__tiles .tile').first().getByRole('button', { name: 'Add' });
  // Any scroll closes the option box. Playwright scrolls the tile into view and clicks in the same frame, so the
  // scroll event of that jump would arrive after the box has opened and close it again: let the event pass first.
  await add.scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await add.click();
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'is in your bag.' })).toBeVisible();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');
});

test('atelier lists its rooms; Furniture and Rings are coming soon', async ({ page }) => {
  await page.goto('/atelier/');
  await expect(page.getByRole('heading', { level: 1, name: 'Atelier' })).toBeVisible();
  await expect(page.locator('.head6__r .soon')).toContainText('Furniture ( )');
  await expect(page.getByRole('link', { name: /Rings/ })).toHaveCount(0);
});

test('fashion filter shows one group at a time', async ({ page }) => {
  await gotoReady(page, '/atelier/fashion/');
  await expect(page.locator('.fgrp .tile')).toHaveCount(18);
  await page.getByRole('button', { name: 'Shirts ( 4 )' }).click();
  await expect(page.locator('.fgrp .tile:visible')).toHaveCount(4);
  await expect(page).toHaveURL(/#shirts$/);
});
