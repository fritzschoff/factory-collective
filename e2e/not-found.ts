import { expect, type Page } from '@playwright/test';

/** The not-found page inside the site chrome — the chrome exactly once — with "Not found" in the title. */
export async function expectNotFoundPage(page: Page) {
  await expect(page.getByText('This page is drawn nowhere.')).toBeVisible();
  await expect(page.locator('header[data-header]')).toHaveCount(1);
  await expect(page.locator('main#main')).toHaveCount(1);
  await expect(page.locator('main main')).toHaveCount(0);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.locator('#menu')).toHaveCount(1);
  await expect(page.locator('#search')).toHaveCount(1);
  const repeated = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(repeated).toEqual([]);
  await expect(page).toHaveTitle(/Not found/);
}
