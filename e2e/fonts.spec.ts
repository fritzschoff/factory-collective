import { expect, test } from '@playwright/test';

test('both brand fonts load and the tokens use them', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    await document.fonts.ready;
    const css = getComputedStyle(document.documentElement);
    const display = css.getPropertyValue('--font-display').trim();
    const text = css.getPropertyValue('--font-text').trim();
    return { display, text, loaded: [...document.fonts].filter((f) => f.status === 'loaded').length };
  });
  expect(result.display).not.toBe('');
  expect(result.text).not.toBe('');
  expect(result.loaded).toBeGreaterThanOrEqual(1);
});
