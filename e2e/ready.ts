import type { Page } from '@playwright/test';

/**
 * page.goto, then waits until React has hydrated the page (HydrationMark sets `data-hydrated` on <html>).
 * Before that a button does nothing, and a radio that is clicked moves its native state while React still holds the
 * old value. Returns the response of the navigation, as goto does.
 */
export async function gotoReady(page: Page, url: string) {
  const response = await page.goto(url);
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  return response;
}
