import { readJson } from './load-catalog.mjs';
/** minimal Stripe REST client (no SDK). STRIPE_API_BASE lets tests point it at a mock. */
export function stripeClient(env = process.env) {
  const base = (env.STRIPE_API_BASE || 'https://api.stripe.com').replace(/\/$/, '');
  if (!env.STRIPE_SECRET_KEY) { console.error('STRIPE_SECRET_KEY is not set (put it in .env).'); process.exit(1); }
  const enc = (obj, prefix = '', out = []) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v == null) continue; const key = prefix ? `${prefix}[${k}]` : k;
      if (Array.isArray(v)) v.forEach((x, i) => (typeof x === 'object' ? enc(x, `${key}[${i}]`, out) : out.push([`${key}[${i}]`, String(x)])));
      else if (typeof v === 'object') enc(v, key, out); else out.push([key, String(v)]);
    }
    return out;
  };
  async function call(path, body, method = body ? 'POST' : 'GET') {
    const r = await fetch(base + path, { method, headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) }, body: body ? new URLSearchParams(enc(body)).toString() : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Stripe ${method} ${path}: ${r.status} ${j?.error?.message ?? ''}`);
    return j;
  }
  async function listAll(path, params = '') {
    const out = []; let after = '';
    for (;;) {
      const j = await call(`${path}?limit=100${params}${after ? `&starting_after=${after}` : ''}`);
      out.push(...j.data); if (!j.has_more) break; after = j.data[j.data.length - 1].id;
    }
    return out;
  }
  return { call, listAll, base };
}
export { readJson };
