import { describe, expect, it } from 'vitest';
import { SOON, isSoon, soonHref, soonLabel, soonPaths, soonRedirects, withBrackets } from './soon';

describe('coming-soon registry', () => {
  it('adds the empty brackets exactly once', () => {
    expect(soonLabel('furniture')).toBe('Furniture ( )');
    expect(soonLabel('theses')).toBe('T03 ( )  T04 ( )');
    expect(soonLabel('campaign03')).toBe('( 03 ) ( )');
  });

  it('puts the empty brackets after any text, unless it already shows them', () => {
    expect(withBrackets('Read the text')).toBe('Read the text ( )');
    expect(withBrackets('Read the text ( )')).toBe('Read the text ( )');
    expect(withBrackets('( )')).toBe('( )');
  });

  it('redirects every removed page to its parent while it is soon', () => {
    const r = soonRedirects();
    expect(r).toHaveLength(11);
    expect(r).toEqual(expect.arrayContaining([
      { source: '/atelier/furniture/', destination: '/atelier/', permanent: false },
      { source: '/factory/bag-profile-series/', destination: '/factory/', permanent: false },
      { source: '/factory/publishing/', destination: '/factory/', permanent: false },
      { source: '/factory/archive/', destination: '/factory/', permanent: false },
      { source: '/factory/lectures/', destination: '/factory/', permanent: false },
      { source: '/studio/exhibitions/', destination: '/studio/', permanent: false },
      { source: '/studio/sound/', destination: '/studio/', permanent: false },
      { source: '/studio/scenography/', destination: '/studio/', permanent: false },
      { source: '/studio/architecture/', destination: '/studio/', permanent: false },
      { source: '/journal/', destination: '/', permanent: false },
      { source: '/press/', destination: '/about/', permanent: false },
    ]));
  });

  it('entries without an address have no redirect', () => {
    expect(soonRedirects().some((r) => r.source.includes('outerwear'))).toBe(false);
  });

  it('isSoon and soonPaths agree with the registry', () => {
    expect(Object.keys(SOON)).toHaveLength(16);
    expect(isSoon('journal')).toBe(true);
    expect(soonPaths()).toContain('/press/');
    expect(soonPaths()).toHaveLength(11);
  });

  it('while soon there is nothing to link to', () => {
    expect(soonHref('furniture')).toBeUndefined();
  });

  it('switched to live: linked again, no redirect, no longer forbidden', () => {
    const live = { ...SOON, furniture: { ...SOON.furniture, status: 'live' as const } };
    expect(isSoon('furniture', live)).toBe(false);
    expect(soonHref('furniture', live)).toBe('/atelier/furniture/');
    expect(soonRedirects(live).map((r) => r.source)).not.toContain('/atelier/furniture/');
    expect(soonPaths(live)).not.toContain('/atelier/furniture/');
  });

  it('a live entry without a page of its own has nothing to link to', () => {
    const live = { ...SOON, rings: { ...SOON.rings, status: 'live' as const } };
    expect(soonHref('rings', live)).toBeUndefined();
  });
});
