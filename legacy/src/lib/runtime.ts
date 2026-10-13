/**
 * Build-time context. The build script fills this in before it renders the pages.
 * Components read it; nothing here exists in the browser.
 */
export type ImageMode = 'local' | 'stripe' | 'strict' | 'placeholders';

export interface StripeEntry {
  productId: string;
  priceId?: string | null;
  unitAmount?: number | null;
  currency?: string;
  images?: string[];
  active?: boolean;
}

export interface Ctx {
  mode: ImageMode;
  demoPrices: boolean;
  siteUrl: string;
  /** slot → path relative to public/images, files the team has put there */
  local: Record<string, string>;
  /** slot → path relative to public/images, files downloaded from Stripe (stripe:sync --download) */
  stripeFiles: Record<string, string>;
  /** slot → remote url from the Stripe product (when not downloaded) */
  stripeUrls: Record<string, string>;
  /** path relative to public/images → intrinsic size */
  dims: Record<string, { w: number; h: number }>;
  /** variants exist (sharp ran) */
  variants: boolean;
  variantWidths: number[];
  stripe: Record<string, StripeEntry>;
  manualPrices: Record<string, number>;
  /** filled while rendering */
  usage: Map<string, { ratios: Set<string>; pages: Set<string>; widths: Set<number> }>;
  currentPage: string;
  generatedAt: string;
  assets: { css: string; js: string };
  dev: boolean;
  signTotalEm: number;
}

export const ctx: Ctx = {
  mode: 'local', demoPrices: false, siteUrl: 'http://localhost:3000',
  local: {}, stripeFiles: {}, stripeUrls: {}, dims: {}, variants: false, variantWidths: [480, 960, 1600],
  stripe: {}, manualPrices: {}, usage: new Map(), currentPage: '', generatedAt: '', assets: { css: '', js: '' }, dev: false, signTotalEm: 19.596
};
