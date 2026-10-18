import { test } from '@playwright/test';
import { gotoReady } from './ready';

/**
 * Not a test: takes full-page screenshots of the main pages (desktop 1440 and phone 390) into test-results/visual/ so a
 * person can look at them. Skipped unless VISUAL=1:  VISUAL=1 npx playwright test e2e/visual.spec.ts
 */
const PAGES = ['/', '/atelier/', '/atelier/fashion/', '/atelier/fashion/sh-001/', '/atelier/bags/', '/factory/', '/factory/tectonics-without-origin/', '/studio/', '/studio/layer-paintings/lp-02/', '/campaigns/01/', '/about/', '/bag/'];

test.describe('@visual @phone screenshots for review', () => {
  test.skip(!process.env.VISUAL, 'set VISUAL=1 to take review screenshots');

  for (const path of PAGES) {
    test(path, async ({ page }, info) => {
      test.setTimeout(90_000);
      await gotoReady(page, path);
      await page.evaluate(async () => {
        await document.fonts.ready;
        // a full-page screenshot does not scroll: walk down the page so the lazy pictures load, then come back up
        // (the site scrolls smoothly, so jump: 'instant')
        for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 150));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      // every picture is in, and back at the top the header has unfolded again (its transitions are done)
      await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0), undefined, { timeout: 60_000 });
      await page.waitForFunction(() => window.scrollY === 0 && !document.querySelector('.hd')?.classList.contains('is-compact'));
      await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))));
      const name = `${info.project.name}${path === '/' ? '_home' : path.replace(/\/$/, '').replace(/\//g, '_')}.png`;
      await page.screenshot({ path: `test-results/visual/${name}`, fullPage: true });
    });
  }
});
