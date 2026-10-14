import { expect, test } from '@playwright/test';
import { signAdvances, signGeometry } from '../src/lib/sign/geometry';
import { greenUnderneath, pixel } from './pixels';

const G = signGeometry();
const GREEN: [number, number, number] = [0, 255, 0];
const WHITE: [number, number, number] = [255, 255, 255];

/** centre of the window and a point of the white row, in page pixels */
async function points(page: import('@playwright/test').Page) {
  const row = (await page.locator('.hd__sign').boundingBox())!;
  const y = row.y + row.height * 0.55;
  const at = (fraction: number) => row.x + row.width * (0.0055 + 0.989 * fraction);
  return { window: { x: at(G.xA) + 12, y }, wall: { x: at(0.2), y } };
}

test.describe('header', () => {
  test('is fixed and its sign row has exactly one window', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header[data-header]')).toHaveCSS('position', 'fixed');
    // the menu carries the same sign row — always scope to the header
    expect((await page.locator('header[data-header] .hd__bg path').getAttribute('d'))?.match(/M/g)).toHaveLength(2);
  });

  test('the window shows what lies beneath, the rest of the row is white', async ({ page }) => {
    await page.goto('/');
    await greenUnderneath(page);
    const p = await points(page);
    expect(await pixel(page, p.window.x, p.window.y)).toEqual(GREEN);
    expect(await pixel(page, p.wall.x, p.wall.y)).toEqual(WHITE);
  });

  test('outside the 1440 frame the header is white', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    await greenUnderneath(page);
    const row = (await page.locator('.hd__sign').boundingBox())!;
    expect(await pixel(page, 20, row.y + row.height / 2)).toEqual(WHITE);
    expect(await pixel(page, 1900, row.y + row.height / 2)).toEqual(WHITE);
  });

  test('sign glyphs have the measured advances (the window stays on the brackets)', async ({ page }) => {
    for (const width of [390, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const r = await page.evaluate(async () => {
        await document.fonts.ready;
        const spans = [...document.querySelectorAll<HTMLElement>('header[data-header] .hd__glyphs > span')];
        const size = parseFloat(getComputedStyle(spans[0]).fontSize);
        return { size, widths: spans.map((s) => s.getBoundingClientRect().width) };
      });
      const adv = signAdvances();
      expect(r.widths).toHaveLength(adv.length);
      r.widths.forEach((w, i) => expect(Math.abs(w - adv[i] * r.size)).toBeLessThan(1));
    }
  });

  test('folds circles and labels away after 40 px, unfolds at the top', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { document.body.style.minHeight = '4000px'; });
    const header = page.locator('header[data-header]');
    await expect(header).not.toHaveClass(/is-compact/);
    await page.mouse.wheel(0, 300);
    await expect(header).toHaveClass(/is-compact/);
    await expect(page.locator('.hd__bot button').first()).toHaveCSS('opacity', '0');
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).not.toHaveClass(/is-compact/);
  });

  test('page content starts below the header', async ({ page }) => {
    await page.goto('/');
    const header = (await page.locator('header[data-header]').boundingBox())!;
    const main = (await page.locator('main#main h1').first().boundingBox())!;
    expect(main.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
  });

  test('@phone the header keeps its window on a phone', async ({ page }) => {
    await page.goto('/');
    await greenUnderneath(page);
    const p = await points(page);
    expect(await pixel(page, p.window.x, p.window.y)).toEqual(GREEN);
  });
});
