import { ctx } from './runtime';
import { SAMPLES } from '../content/samples';

export type Source = 'local' | 'stripe' | 'stripe-remote' | 'sample' | 'none';
export interface Resolved {
  slot: string;
  source: Source;
  /** url of the original (served from /images/…) or remote url; null = placeholder */
  src: string | null;
  /** path relative to public/images (for variants) */
  rel: string | null;
  w?: number;
  h?: number;
}

const ASSET = '/images/';

/**
 * Where does the picture for a slot come from?
 *  1. a file the team put in public/images/<slot>.jpg      (source: local)
 *  2. a picture on the Stripe product                       (source: stripe)
 *  3. the sample picture shipped with the code (not in IMAGES=strict)  (source: sample)
 *  4. nothing → a placeholder that shows the slot name
 * IMAGES=stripe swaps 1 and 2. IMAGES=placeholders forces 4 everywhere.
 */
export function resolve(slot: string): Resolved {
  const none: Resolved = { slot, source: 'none', src: null, rel: null };
  if (ctx.mode === 'placeholders') return none;
  const local = ctx.local[slot];
  const sf = ctx.stripeFiles[slot];
  const su = ctx.stripeUrls[slot];
  const sample = SAMPLES[slot];
  const make = (source: Source, rel: string): Resolved => ({ slot, source, rel, src: ASSET + rel, ...(ctx.dims[rel] || {}) });
  const order: (() => Resolved | null)[] = [];
  const L = () => (local ? make('local', local) : null);
  const S = () => (sf ? make('stripe', sf) : su ? { slot, source: 'stripe-remote' as Source, src: su, rel: null } : null);
  const M = () => (sample && ctx.mode !== 'strict' ? make('sample', '_sample/' + sample + '.jpg') : null);
  if (ctx.mode === 'stripe') order.push(S, L, M); else order.push(L, S, M);
  for (const f of order) { const r = f(); if (r) return r; }
  return none;
}

export function track(slot: string, ratio: string, width?: number) {
  let u = ctx.usage.get(slot);
  if (!u) ctx.usage.set(slot, (u = { ratios: new Set(), pages: new Set(), widths: new Set() }));
  u.ratios.add(ratio);
  if (ctx.currentPage) u.pages.add(ctx.currentPage);
  if (width) u.widths.add(width);
}

/** srcset for a resolved local picture (needs the build to have created variants) */
export function srcSet(r: Resolved): string | undefined {
  if (!ctx.variants || !r.rel || !r.w) return undefined;
  const out: string[] = [];
  for (const w of ctx.variantWidths) if (w < r.w * 0.92) out.push(`${ASSET}_v/${r.rel.replace(/\.[a-z]+$/i, '')}@${w}.webp ${w}w`);
  out.push(`${ASSET}${r.rel} ${r.w}w`);
  return out.length > 1 ? out.join(', ') : undefined;
}

export function url(slot: string, w?: number): string | null {
  const r = resolve(slot);
  if (!r.src) return null;
  if (ctx.variants && r.rel && r.w && w) {
    const v = ctx.variantWidths.find((x) => x >= w && x < r.w! * 0.92);
    if (v) return `${ASSET}_v/${r.rel.replace(/\.[a-z]+$/i, '')}@${v}.webp`;
  }
  return r.src;
}
