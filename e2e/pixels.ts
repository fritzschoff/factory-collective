import type { Page } from '@playwright/test';
import { PNG } from 'pngjs';

/** The colour of one screen pixel (device scale 1). */
export async function pixel(page: Page, x: number, y: number): Promise<[number, number, number]> {
  const png = PNG.sync.read(await page.screenshot({ clip: { x: Math.round(x), y: Math.round(y), width: 1, height: 1 } }));
  return [png.data[0], png.data[1], png.data[2]];
}

/** Lays a full-screen green sheet under everything that is fixed, so see-through areas show green. */
export async function greenUnderneath(page: Page): Promise<void> {
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;background:#00ff00;z-index:1';
    document.body.appendChild(d);
  });
}

/**
 * Like greenUnderneath, but a full-screen button that counts the clicks reaching it.
 * Returns a function that reads the count — what the page beneath the header has been clicked.
 */
export async function clickableUnderneath(page: Page): Promise<() => Promise<number>> {
  await page.evaluate(() => {
    const b = document.createElement('button');
    b.id = 'clicked-beneath';
    b.type = 'button';
    b.dataset.clicks = '0';
    b.style.cssText = 'position:fixed;inset:0;z-index:1;margin:0;padding:0;border:0;background:#00ff00';
    b.addEventListener('click', () => { b.dataset.clicks = String(Number(b.dataset.clicks) + 1); });
    document.body.appendChild(b);
  });
  return () => page.evaluate(() => Number(document.getElementById('clicked-beneath')?.dataset.clicks));
}
