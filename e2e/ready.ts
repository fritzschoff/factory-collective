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

/**
 * Holds back every script of the page until the returned function is called: what is clicked until then is clicked
 * before hydration. Open the page with `waitUntil: 'domcontentloaded'` — its load event waits for the scripts.
 */
export async function holdScripts(page: Page): Promise<() => void> {
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route(/\/_next\/static\/.+\.js(\?|$)/, async (route) => {
    await held;
    await route.continue();
  });
  return release;
}
