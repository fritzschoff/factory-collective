import { expect, test } from '@playwright/test';
import { gotoReady } from './ready';

test('checkout against the shop keeps an unordered bag', async ({ page }) => {
  test.skip(!process.env.NEXT_PUBLIC_API_BASE, 'shop api is not configured');
  await gotoReady(page, '/atelier/scan-series/ob-011/');
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await gotoReady(page, '/bag/');
  const checkout = page.getByRole('button', { name: 'Checkout' });
  if (await checkout.isDisabled()) {
    await expect(page.locator('.sum__e')).toHaveText('This piece has no price yet.');
  } else {
    await checkout.click();
    await page.waitForURL(/checkout\.stripe\.com|\/bag\/thank-you/);
  }
  await gotoReady(page, '/bag/thank-you/?session_id=cs_test_missing');
  await expect(page.getByText('Your bag is unchanged.')).toBeVisible();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');
});
