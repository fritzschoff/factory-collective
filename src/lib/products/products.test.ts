import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { defaultValueIndex } from './options';
import { toSummary } from './summary';

// Which picture a slot gets depends on the IMAGES switch and on the photographs the owner has put into
// public/images (the manifest). Neither may change this test: no real pictures, and local mode.
vi.mock('@/generated/image-manifest.json', () => ({ default: { slots: {} } }));

const sh = PRODUCTS.find((p) => p.id === 'SH-001')!;

describe('options', () => {
  it('starts with the middle size, otherwise the first value', () => {
    const size = sh.options.find((o) => o.id === 'size')!;
    const colour = sh.options.find((o) => o.id === 'colour')!;
    expect(size.values![defaultValueIndex(size)].id).toBe('50');
    expect(defaultValueIndex(colour)).toBe(0);
    const ring = PRODUCTS.find((p) => p.id === 'BR-A')!.options.find((o) => o.id === 'size')!;
    expect(ring.values![defaultValueIndex(ring)].id).toBe('M');
  });
});

describe('toSummary', () => {
  beforeEach(() => {
    vi.stubEnv('IMAGES', 'local');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is plain data the browser can receive', () => {
    const s = toSummary({ ...sh, priceCents: 28000 });
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    expect(s).toMatchObject({ id: 'SH-001', code: 'SH / 001', href: '/atelier/fashion/sh-001/', priceCents: 28000, img: '/images/_sample/camp2/sh_grey_band.jpg' });
  });
});
