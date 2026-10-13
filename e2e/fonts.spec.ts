import { expect, test } from '@playwright/test';

test('both brand fonts load and the tokens use them', async ({ page }) => {
  await page.goto('/');
  const fonts = await page.evaluate(async () => {
    const css = getComputedStyle(document.documentElement);
    const unquote = (name: string) => name.trim().replace(/^["']|["']$/g, '');
    const families = (list: string) => list.split(',').map(unquote);
    // The brand face is the first family of --font-display / --font-text. The names after it are fallbacks, among
    // them local(Arial) faces that count as loaded even when the .woff is missing, so only the first one is checked.
    const probe = async (fontVar: string, tokenVar: string) => {
      const [family] = families(css.getPropertyValue(fontVar));
      const face = [...document.fonts].find((f) => unquote(f.family) === family);
      try {
        await face?.load();
      } catch {
        // a failed download shows up as the status below
      }
      return { family, status: face?.status ?? 'missing', token: families(css.getPropertyValue(tokenVar)) };
    };
    return { display: await probe('--font-display', '--display'), text: await probe('--font-text', '--text') };
  });

  for (const [name, font] of [['display', fonts.display], ['text', fonts.text]] as const) {
    expect(font.family, `--font-${name} names a font family`).not.toBe('');
    expect(font.status, `--font-${name}: the "${font.family}" face loads`).toBe('loaded');
    expect(font.token, `--${name} uses the "${font.family}" family`).toContain(font.family);
  }
});
