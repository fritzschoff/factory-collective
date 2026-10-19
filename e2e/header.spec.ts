import { expect, test } from '@playwright/test';
import { signAdvances, signGeometry } from '../src/lib/sign/geometry';
import { clickableUnderneath, greenUnderneath, pixel } from './pixels';

const G = signGeometry();
const GREEN: [number, number, number] = [0, 255, 0];
const WHITE: [number, number, number] = [255, 255, 255];

/** Where the content of the page starts: the top of main's content box, below the padding that clears the header. */
const contentTop = (page: import('@playwright/test').Page) =>
  page.locator('main#main').evaluate((main) => main.getBoundingClientRect().top + parseFloat(getComputedStyle(main).paddingTop));

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
    // Chromium on Linux (CI) applies the font's hinting and moves single advances by up to ~2.4 px, so the unhinted
    // metrics cannot be checked there; the pixel tests through the window above still pass on Linux
    test.skip(process.platform === 'linux', 'Linux Chromium hints the glyph advances');
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
    // everything that folds away: the circles F · A · S, the room buttons, the brackets beside Atelier, Campaigns and About
    const folding = header.locator('.hd__bb, .hd__bot > button, .hd__br, .hd__r button');
    const factory = header.getByRole('button', { name: 'Factory' });
    await expect(header).not.toHaveClass(/is-compact/);
    await expect(folding).toHaveCount(10);
    for (const part of await folding.all()) await expect(part).toBeVisible();
    await expect(factory).toHaveCount(1);

    await page.mouse.wheel(0, 300);
    await expect(header).toHaveClass(/is-compact/);
    await expect(page.locator('.hd__bot button').first()).toHaveCSS('opacity', '0');
    // once faded they also leave the accessibility tree and the tab order
    for (const part of await folding.all()) await expect(part).toBeHidden();
    await expect(factory).toHaveCount(0);
    await header.getByRole('link', { name: /^Bag/ }).focus();
    await page.keyboard.press('Tab');
    await expect(header.locator('a.hd__sign')).toBeFocused();
    await page.keyboard.press('Tab'); // would be Factory if the folded row were still in the tab order
    expect(await page.evaluate(() => !!document.activeElement?.closest('.hd__bot'))).toBe(false);

    // unfolding shows them at once: a frame after the scroll the labels are back while their fade-in still runs
    const back = await page.evaluate(async () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return getComputedStyle(document.querySelector('header[data-header] .hd__bot > button')!).visibility;
    });
    expect(back).toBe('visible');
    await expect(header).not.toHaveClass(/is-compact/);
    for (const part of await folding.all()) await expect(part).toBeVisible();
    await expect(factory).toHaveCount(1);
    await header.locator('a.hd__sign').focus();
    await page.keyboard.press('Tab');
    await expect(factory).toBeFocused();
  });

  test('the white areas catch the pointer — nothing reaches the page beneath', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    await page.evaluate(() => { document.body.style.minHeight = '4000px'; });
    const header = page.locator('header[data-header]');
    const sign = header.locator('a.hd__sign');
    const clicksBeneath = await clickableUnderneath(page);
    // the sign is the home link: count its clicks instead of following them
    await sign.evaluate((link: HTMLAnchorElement) => {
      link.dataset.clicks = '0';
      link.addEventListener('click', (event) => { event.preventDefault(); link.dataset.clicks = String(Number(link.dataset.clicks) + 1); });
    });
    const box = async (part: string) => (await header.locator(part).boundingBox())!;
    const middle = (b: { y: number; height: number }) => b.y + b.height / 2;

    /** Clicks every white area of the header as it stands now: the rows and the hairline inside the frame, the margins beside it. */
    const clickWhiteAreas = async (state: string, withBottomRow: boolean) => {
      await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished))); // let the fold finish moving
      const [top, row, hair] = [await box('.hd__top'), await box('.hd__sign'), await box('.hd__hair')];
      const areas: [string, number, number][] = [
        ['top row', top.x + top.width * 0.2, middle(top)],
        ['hairline', hair.x + hair.width * 0.5, middle(hair)],
        ['left margin beside the top row', 20, middle(top)],
        ['left margin beside the sign', 20, middle(row)],
        ['right margin beside the sign', 1900, middle(row)],
        ['left margin beside the hairline', 20, middle(hair)],
      ];
      if (withBottomRow) {
        const bottom = await box('.hd__bot');
        areas.push(['bottom row', bottom.x + bottom.width * 0.2, middle(bottom)], ['right margin beside the bottom row', 1900, middle(bottom)]);
      }
      for (const [name, x, y] of areas) {
        await page.mouse.click(x, y);
        expect(await clicksBeneath(), `${state}: a click in the ${name} reached the page beneath`).toBe(0);
      }
    };

    await clickWhiteAreas('unfolded', true);
    await page.mouse.wheel(0, 300);
    await expect(header).toHaveClass(/is-compact/);
    await clickWhiteAreas('folded', false); // the bottom row is gone then

    // the window is part of the sign, so a click there is a click on the home link — not on the page beneath
    const p = await points(page);
    await page.mouse.click(p.window.x, p.window.y);
    expect(await clicksBeneath()).toBe(0);
    expect(await sign.getAttribute('data-clicks')).toBe('1');

    // the page beneath does receive clicks below the header, so the zeros above mean something
    await page.mouse.click(960, 500);
    expect(await clicksBeneath()).toBe(1);
  });

  test('page content starts below the header', async ({ page }) => {
    await page.goto('/');
    const header = (await page.locator('header[data-header]').boundingBox())!;
    expect(await contentTop(page)).toBeGreaterThanOrEqual(header.y + header.height - 1);
  });

  test('the phone layout and the offset under the header switch at the same width, also beside a scrollbar', async ({ page }) => {
    // The media queries (and --hd-h with them) see the whole viewport; the header only what a classic scrollbar leaves of it,
    // up to 17 px less. Headless Chromium hides scrollbars, so a gutter on the header's right edge stands in for one.
    // The widths straddle the 700 px switch: if the header went phone-sized sooner than the offset, the page would slide under it.
    const cases: [width: number, gutter: number][] = [[390, 0], [700, 15], [701, 15], [705, 15], [715, 15], [1024, 15]];
    for (const [width, gutter] of cases) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      if (gutter) await page.addStyleTag({ content: `.hd { right: ${gutter}px !important; }` });
      await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished))); // the gutter may start a height transition: measure after it
      const header = (await page.locator('header[data-header]').boundingBox())!;
      const top = await contentTop(page);
      const bottom = header.y + header.height;
      expect(header.width, `${width} px wide: the gutter is in place`).toBe(width - gutter);
      expect(top, `${width} px wide, ${gutter} px gutter: the content starts below the header`).toBeGreaterThanOrEqual(bottom - 1);
      expect(top, `${width} px wide, ${gutter} px gutter: and right under it, with no gap`).toBeLessThan(bottom + 3); // vw is a little wider than the header
    }
  });

  test('@phone the header keeps its window on a phone', async ({ page }) => {
    await page.goto('/');
    await greenUnderneath(page);
    const p = await points(page);
    expect(await pixel(page, p.window.x, p.window.y)).toEqual(GREEN);
  });
});
