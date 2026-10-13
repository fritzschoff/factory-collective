#!/usr/bin/env node
/**
 * Reads the Stripe products into data/stripe-catalog.json (prices, price ids, picture urls).
 * The next build (npm run build) uses them: prices on every page, Stripe Checkout with the real price ids.
 *   node scripts/stripe-sync.mjs               prices + picture URLs
 *   node scripts/stripe-sync.mjs --download    also download the pictures into public/images/_stripe/<slot>.jpg
 *                                              (so the site serves them itself, resized, with srcset)
 * Product ↔ code:  metadata  cfc_code  on the Stripe product (e.g. JK-001, CI-07.P).
 * Picture ↔ slot:  the n-th picture of a Stripe product is the n-th slot of the product (JK-001, JK-001-2, …).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './lib/env.mjs';
import { loadCatalog } from './lib/load-catalog.mjs';
import { stripeClient } from './lib/stripe.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnv(ROOT);
const download = process.argv.includes('--download');
const { PRODUCTS } = await loadCatalog(ROOT);
const known = new Map(PRODUCTS.map((p) => [p.id, p]));
const stripe = stripeClient();

const list = await stripe.listAll('/v1/products', '&active=true&expand[]=data.default_price');
const out = { fetchedAt: new Date().toISOString(), products: {} };
const unknown = [], noPrice = [];
for (const sp of list) {
  const code = sp.metadata?.cfc_code;
  if (!code) { unknown.push(`${sp.name} (${sp.id}) — no cfc_code`); continue; }
  if (!known.has(code)) { unknown.push(`${sp.name} (${sp.id}) — cfc_code "${code}" is not in the catalogue`); continue; }
  const dp = sp.default_price && typeof sp.default_price === 'object' ? sp.default_price : null;
  if (!dp) noPrice.push(code);
  out.products[code] = { productId: sp.id, priceId: dp?.id ?? null, unitAmount: dp?.unit_amount ?? null, currency: dp?.currency ?? 'eur', images: sp.images || [], active: sp.active };
}
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data/stripe-catalog.json'), JSON.stringify(out, null, 2));

if (download) {
  let n = 0;
  for (const [code, e] of Object.entries(out.products)) {
    const p = known.get(code);
    for (const [i, u] of e.images.entries()) {
      const slot = p.images[i]; if (!slot) { console.log(`  ${code}: picture ${i + 1} has no slot — skipped`); continue; }
      const r = await fetch(u); if (!r.ok) { console.log('  download failed', u); continue; }
      const type = r.headers.get('content-type') || ''; const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('avif') ? 'avif' : 'jpg';
      const dst = path.join(ROOT, 'public/images/_stripe', `${slot}.${ext}`);
      fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.writeFileSync(dst, Buffer.from(await r.arrayBuffer())); n++;
    }
  }
  console.log(`downloaded ${n} pictures into public/images/_stripe/`);
}
const total = Object.keys(out.products).length;
console.log(`${total} of ${PRODUCTS.length} catalogue entries found in Stripe`);
const missing = PRODUCTS.filter((p) => !out.products[p.id]).map((p) => p.id);
if (missing.length) console.log(`not in Stripe yet (${missing.length}): ${missing.join(' ')}`);
if (noPrice.length) console.log(`in Stripe but without a default price (${noPrice.length}): ${noPrice.join(' ')}`);
for (const u of unknown) console.log('ignored:', u);
console.log('→ data/stripe-catalog.json written. Run  npm run build  to publish prices.');
