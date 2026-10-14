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
