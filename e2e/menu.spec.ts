import { expect, test, type Page } from '@playwright/test';
import { pixel } from './pixels';

const menu = (page: Page) => page.locator('#menu');
/** the panel of one room — all five are in the page, only the chosen one is visible */
const panel = (page: Page, room: string) => menu(page).getByRole('tabpanel', { name: room });
const menuButton = (page: Page) => page.locator('.hd__util').getByRole('button', { name: 'Menu' });
const roomLabel = (page: Page, room: string) => page.locator('.hd__bot').getByRole('button', { name: room });

/**
 * Opens the menu with `open`, and tries again until it is open: a button pressed before the page has hydrated does
 * nothing. An open menu is left alone — pressing Menu again would close it.
 */
const openMenu = (page: Page, open: () => Promise<unknown>) => expect(async () => {
  if (!(await menu(page).evaluate((el) => el.classList.contains('is-open')))) await open();
  await expect(menu(page)).toHaveClass(/is-open/, { timeout: 500 });
}).toPass({ timeout: 10_000 });
const pressMenuButton = (page: Page) => () => menuButton(page).click({ timeout: 1000 });
const pressRoomLabel = (page: Page, room: string) => () => roomLabel(page, room).click({ timeout: 1000 });
/** The panel comes down with an animation; measure it once it has. */
const panelHasComeDown = (page: Page) => page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
const enterOnMenuButton = (page: Page) => async () => { await menuButton(page).focus(); await page.keyboard.press('Enter'); };

test.describe('menu', () => {
  test('all five rooms are in the HTML; a closed menu loads no pictures', async ({ page }) => {
    await page.goto('/');
    await expect(menu(page).locator('[role=tabpanel]')).toHaveCount(5);
    await expect(menu(page).locator('.bwin__img')).toHaveCount(0);
  });

  // Once the shell passes about 12.8 KB (the menu alone is some 30 KB), React sends every Suspense boundary of more than
  // 500 bytes after it and reveals it by a script it holds back for about 300 ms after the first paint. Nothing that has
  // to show at once may sit in such a boundary: no template placeholder for a boundary that is filled in later.
  test('header, menu and page are in the first HTML, not behind a boundary that is revealed late', async ({ page, request }) => {
    const html = await (await request.get('/')).text();
    expect(html).not.toMatch(/<template id="B:\d+"/);
    expect(html).toContain('<header class="hd"');
    expect(html).toContain('id="menu"');
    await page.goto('/');
    // no waiting: right after load they have a box
    expect(await page.locator('header[data-header] .hd__sign').isVisible()).toBe(true);
    expect(await page.locator('main#main').isVisible()).toBe(true);
  });

  test('Menu opens the room of the page; Esc closes and gives focus back', async ({ page }) => {
    await page.goto('/');
    const trigger = menuButton(page);
    await openMenu(page, pressMenuButton(page));
    await expect(menu(page).getByRole('tab', { name: 'Atelier' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Escape');
    await expect(menu(page)).not.toHaveClass(/is-open/);
    await expect(trigger).toBeFocused();
  });

  test('a room label opens that room; tabs switch without closing; the dim closes', async ({ page }) => {
    await page.goto('/');
    await openMenu(page, pressRoomLabel(page, 'Factory'));
    await expect(menu(page).getByRole('tab', { name: 'Factory' })).toHaveAttribute('aria-selected', 'true');
    await menu(page).getByRole('tab', { name: 'Studio' }).click();
    await expect(menu(page)).toHaveClass(/is-open/);
    await expect(panel(page, 'Studio').getByText('Conceptual Interference', { exact: true })).toBeVisible();
    await page.mouse.click(700, 880);
    await expect(menu(page)).not.toHaveClass(/is-open/);
  });

  test('coming-soon rows are not links', async ({ page }) => {
    await page.goto('/');
    await openMenu(page, pressRoomLabel(page, 'Factory'));
    await expect(panel(page, 'Factory').locator('.soon')).toHaveCount(5);
    await expect(panel(page, 'Factory').getByRole('link', { name: /Publishing|Archive|Lectures/ })).toHaveCount(0);
  });

  test('Tab stays inside the open menu', async ({ page }) => {
    await page.goto('/');
    await openMenu(page, pressMenuButton(page));
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('#menu'))).toBe(true);
    }
  });

  test('opens by keyboard; Tab and Shift+Tab stay inside; Esc closes and gives focus back to Menu', async ({ page }) => {
    await page.goto('/');
    const trigger = menuButton(page);
    await openMenu(page, enterOnMenuButton(page));
    await expect(menu(page).getByRole('button', { name: '( Close )' })).toBeFocused();
    for (const key of ['Shift+Tab', 'Tab']) {
      for (let i = 1; i <= 40; i++) {
        await page.keyboard.press(key);
        expect(await page.evaluate(() => !!document.activeElement?.closest('#menu')), `${key} no. ${i} left the menu`).toBe(true);
      }
    }
    await page.keyboard.press('Escape');
    await expect(menu(page)).not.toHaveClass(/is-open/);
    await expect(trigger).toBeFocused();
  });

  test('Tab never stops on a coming-soon row', async ({ page }) => {
    await page.goto('/');
    await openMenu(page, pressRoomLabel(page, 'Factory'));
    const stops = new Set<string>();
    for (let i = 1; i <= 40; i++) { // two rounds of the Factory panel
      await page.keyboard.press('Tab');
      const stop = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim() ?? '', soon: !!document.activeElement?.closest('.soon') }));
      expect(stop.soon, `Tab no. ${i} stopped on "${stop.text}", a coming-soon row`).toBe(false);
      stops.add(stop.text);
    }
    // the rows around them are reached, so the check above looked at something
    expect([...stops]).toEqual(expect.arrayContaining(['Texts', 'Glossary', 'T02 // ordinary object']));
    expect([...stops].filter((t) => /Publishing|Archive|Lectures|Bag \/ Profile Series|T03/.test(t))).toEqual([]);
  });

  test('the focus ring of a tab is not cut off by the scrolling tab row', async ({ page }) => {
    await page.goto('/');
    await openMenu(page, enterOnMenuButton(page));
    await expect(menu(page).getByRole('button', { name: '( Close )' })).toBeFocused();
    for (let i = 0; i < 5; i++) await page.keyboard.press('Shift+Tab'); // Close, then back over About, Campaigns, Studio, Atelier
    const first = menu(page).getByRole('tab', { name: 'Factory' });
    await expect(first).toBeFocused();
    await panelHasComeDown(page);
    const box = (await first.boundingBox())!;
    // the ring lies 3 px outside the button, 1.5 px thick: look for its ink left of the word, above it and below it
    const ink = async (xs: number[], ys: number[]) => {
      for (const x of xs) for (const y of ys) if ((await pixel(page, x, y))[0] < 120) return true;
      return false;
    };
    const mid = Math.round(box.y + box.height / 2);
    const across = [box.x + 4, box.x + box.width / 2, box.x + box.width - 4];
    expect(await ink([box.x - 5, box.x - 4, box.x - 3], [mid]), 'the ring beside the first tab').toBe(true);
    expect(await ink(across, [box.y - 5, box.y - 4, box.y - 3].map(Math.round)), 'the ring above the first tab').toBe(true);
    expect(await ink(across, [box.y + box.height + 3, box.y + box.height + 4].map(Math.round)), 'the ring below the first tab').toBe(true);
  });

  test('the window of the panel is as tall as the design says, 8.3 % of the width and 72 px at least', async ({ page }) => {
    // .bwin sets 100 px; the panel's own rule has to win against it
    for (const [width, height] of [[1440, 119.5], [1000, 83], [390, 72]]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await openMenu(page, pressMenuButton(page));
      await panelHasComeDown(page);
      const win = (await menu(page).locator('.mp__body:not([hidden]) .mp__win').boundingBox())!;
      expect(win.height, `${width} px wide`).toBeCloseTo(height, 0);
    }
  });

  test('hovering a row shows its pictures in the window', async ({ page }) => {
    await page.goto('/');
    await openMenu(page, pressMenuButton(page));
    const atelier = panel(page, 'Atelier');
    await atelier.getByRole('link', { name: /Jackets/ }).hover();
    await expect(atelier.locator('.bwin__img').first()).toHaveAttribute('style', /jk_pinstripe/);
    await expect(atelier.locator('.mp__ft')).toHaveText('Atelier / Jackets');
  });

  test('the window does not move when a row is hovered, and the lines around it keep their height', async ({ page }) => {
    await page.goto('/');
    await openMenu(page, pressMenuButton(page));
    const atelier = panel(page, 'Atelier');
    await panelHasComeDown(page);
    const place = async () => {
      const [title, win, cap] = await Promise.all(['.mp__ft', '.mp__win', '.mp__fc'].map((part) => atelier.locator(part).boundingBox()));
      return { title: title!.height, windowTop: win!.y, cap: cap!.height };
    };
    const rest = await place();
    await atelier.getByRole('link', { name: /Jackets/ }).hover();
    await expect(atelier.locator('.mp__ft')).toHaveText('Atelier / Jackets');
    expect(await place()).toEqual(rest);
    await page.mouse.move(700, 600);
    await expect(atelier.locator('.mp__ft')).toHaveText('');
    expect(await place()).toEqual(rest);
  });

  test('the sign at the foot of the panel has its window', async ({ page }) => {
    await page.goto('/');
    await openMenu(page, pressMenuButton(page));
    expect((await menu(page).locator('.mp__sign path').getAttribute('d'))?.match(/M/g)).toHaveLength(2);
  });

  test('the phone layout switches at the width of the viewport, also beside a scrollbar', async ({ page }) => {
    // The media queries see the whole viewport; the panel, and the container its sizes come from, up to 15 px less beside a
    // classic scrollbar. Headless Chromium hides scrollbars, so a gutter on the panel's right edge stands in for one. A
    // container query would stack the columns of a panel that is still the dropped desktop one, from 701 to 715 px.
    const cases: [width: number, phone: boolean][] = [[700, true], [701, false], [705, false], [715, false], [1024, false]];
    for (const [width, phone] of cases) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.addStyleTag({ content: '.mp { right: 15px !important; }' });
      await openMenu(page, pressMenuButton(page));
      await panelHasComeDown(page);
      const columns = await menu(page).locator('.mp__body:not([hidden]) .mp__cols').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      const box = (await menu(page).boundingBox())!;
      expect(box.width, `${width} px wide: the gutter is in place`).toBe(width - 15);
      expect(columns, `${width} px wide: the columns of the panel`).toBe(phone ? 1 : 5);
      expect(box.height >= 900, `${width} px wide: the panel is a full screen`).toBe(phone);
    }
  });

  test('@phone the menu is a full screen with the tabs on top', async ({ page }) => {
    // @phone tests run in both projects, so the phone size is set here: a dropped panel on a desktop is not a full screen
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await openMenu(page, pressMenuButton(page));
    await panelHasComeDown(page);
    const box = (await menu(page).boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(840);
    await expect(menu(page).getByRole('tab', { name: 'About' })).toBeVisible();
  });
});
