#!/usr/bin/env node
/**
 * Creates one Stripe product per catalogue entry (the ones that do not exist yet).
 *   node scripts/stripe-seed.mjs            create missing products
 *   node scripts/stripe-seed.mjs --dry      only print what would be created
 *   node scripts/stripe-seed.mjs --update   also refresh name / description of existing products
 * Matching is done through the product metadata  cfc_code  (= the product id, e.g. JK-001).
 * Prices: if data/prices.json has an EUR amount for the id, a default price is created. Otherwise create it in the Stripe dashboard.
 * Images are NOT uploaded here — add them in the Stripe dashboard (or keep them as files in public/images).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './lib/env.mjs';
import { loadCatalog, readJson } from './lib/load-catalog.mjs';
import { stripeClient } from './lib/stripe.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnv(ROOT);
const dry = process.argv.includes('--dry'), update = process.argv.includes('--update');
const { PRODUCTS } = await loadCatalog(ROOT);
const prices = Object.fromEntries(Object.entries(readJson(path.join(ROOT, 'data/prices.json'), {})).filter(([k, v]) => !k.startsWith('_') && typeof v === 'number'));
const stripe = dry && !process.env.STRIPE_SECRET_KEY ? null : stripeClient();
const existing = new Map();
if (stripe) for (const p of await stripe.listAll('/v1/products', '&active=true')) if (p.metadata?.cfc_code) existing.set(p.metadata.cfc_code, p);

let created = 0, updated = 0, skipped = 0;
for (const p of PRODUCTS) {
  const name = `${p.code} // ${p.name}`;
  const description = [p.sub, p.material, p.description].filter(Boolean).join(' — ').slice(0, 900);
  const metadata = { cfc_code: p.id, cfc_kind: p.kind, cfc_group: p.group, cfc_href: p.href, cfc_options: p.options.map((o) => `${o.id}:${(o.values || []).map((v) => v.label).join('/')}`).join('; ').slice(0, 480) };
  const have = existing.get(p.id);
  if (have) {
    if (update && !dry) { await stripe.call(`/v1/products/${have.id}`, { name, description, metadata }); updated++; console.log('updated ', p.id); } else skipped++;
    continue;
  }
  const eur = prices[p.id];
  console.log(dry ? 'would create' : 'creating    ', p.id.padEnd(9), name, eur != null ? `· € ${eur}` : '· (no price yet)');
  if (dry) { created++; continue; }
  await stripe.call('/v1/products', { name, description, metadata, shippable: true, ...(eur != null ? { default_price_data: { currency: 'eur', unit_amount: Math.round(eur * 100) } } : {}) });
  created++;
}
console.log(`\n${dry ? 'dry run — ' : ''}${created} created · ${updated} updated · ${skipped} already there · ${PRODUCTS.length} in the catalogue`);
console.log('Next: add prices (and pictures) in the Stripe dashboard, then  npm run stripe:sync');
