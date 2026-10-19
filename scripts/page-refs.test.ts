import { describe, expect, it } from 'vitest';
import { hasAnchor, pageRefs } from './page-refs';

describe('page refs', () => {
  const html = `
    <a href="/atelier/">Atelier</a>
    <a href="/atelier/fashion/sh-001/#acc-measurements">guide</a>
    <a href="#states">states</a>
    <a href='/about/'>About</a>
    <img src="/_next/image/?url=%2Fimages%2Ffashion%2FJK-001.jpg&amp;w=64">
    <span style="background-image:url(/images/art/CI-07.jpg)"></span>
    <span style="background-image:url('/images/art/CI-08.webp')"></span>
    <svg><image href="/images/mark.svg" /></svg>
    <section id='states'></section>
    <section id="acc-measurements"></section>
  `;

  it('reads links, same-page anchors, css backgrounds, svg images and the next image file', () => {
    expect(pageRefs(html)).toEqual([
      { url: '/atelier/' },
      { url: '/atelier/fashion/sh-001/', hash: 'acc-measurements' },
      { url: '', hash: 'states' },
      { url: '/about/' },
      { url: '/images/fashion/JK-001.jpg' },
      { url: '/images/mark.svg' },
      { url: '/images/art/CI-07.jpg' },
      { url: '/images/art/CI-08.webp' },
    ]);
  });

  it('stops a css url at an escaped query so the optimiser is not a second file', () => {
    expect(pageRefs('url(/images/art/CI-07.jpg\\u0026w=1920\\u0026q=75)')).toEqual([]);
    expect(pageRefs('url(/images/art/CI-07.jpg)')).toEqual([{ url: '/images/art/CI-07.jpg' }]);
  });

  it('finds an anchor written with either kind of quote', () => {
    expect(hasAnchor(html, 'states')).toBe(true);
    expect(hasAnchor(html, 'acc-measurements')).toBe(true);
    expect(hasAnchor(html, 'missing')).toBe(false);
  });
});
