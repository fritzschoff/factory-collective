/**
 * Production server — no dependencies.
 *   · serves the static site from dist/
 *   · POST /api/checkout        bag → Stripe Checkout Session → { url }
 *   · POST /api/stripe-webhook  verified Stripe events (order paid, products changed → rebuild hook)
 *   · POST /api/enquire         enquiries about originals + the contact form
 *   · POST /api/newsletter      sign-ups
 *   · GET  /api/health
 * Everything is configured through environment variables (see .env.example).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// .env (existing environment wins)
try {
  for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/); if (!m || line.trim().startsWith('#')) continue;
    let v = m[2]; if (/^(".*"|'.*')$/.test(v)) v = v.slice(1, -1); if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
} catch { /* no .env */ }

const env = process.env;
const DIST = path.join(ROOT, 'dist');
const DATA = env.DATA_DIR ? path.resolve(env.DATA_DIR) : path.join(ROOT, 'data');
const PORT = Number(env.PORT || 3000);
const SITE = (env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const STRIPE = (env.STRIPE_API_BASE || 'https://api.stripe.com').replace(/\/$/, '');
const DEV = env.DEV === '1';
fs.mkdirSync(DATA, { recursive: true });

/* ── helpers ───────────────────────────────────────────────── */
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.webmanifest': 'application/manifest+json'
};
const COMPRESS = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt', '.xml']);
const log = (...a: unknown[]) => console.log(new Date().toISOString().slice(11, 19), ...a);

const SEC: Record<string, string> = {
  'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin', 'x-frame-options': 'SAMEORIGIN', 'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; frame-ancestors 'self'; form-action 'self'; base-uri 'self'; object-src 'none'"
};

function send(res: http.ServerResponse, status: number, body: string | Buffer, headers: Record<string, string> = {}) {
  res.writeHead(status, { ...SEC, ...headers });
  res.end(body);
}
const json = (res: http.ServerResponse, status: number, obj: unknown) => send(res, status, JSON.stringify(obj), { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });

function readBody(req: http.IncomingMessage, limit = 64 * 1024): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []; let n = 0;
    req.on('data', (c: Buffer) => { n += c.length; if (n > limit) { reject(Object.assign(new Error('too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
async function readJson(req: http.IncomingMessage) {
  const b = await readBody(req);
  try { return JSON.parse(b.toString('utf8') || '{}'); } catch { throw Object.assign(new Error('Invalid request.'), { status: 400 }); }
}

/* rate limit: sliding window per ip + route group */
const hits = new Map<string, number[]>();
function limited(ip: string, group: string, max: number, windowMs = 60_000) {
  const k = group + ip, now = Date.now(); const a = (hits.get(k) || []).filter((t) => now - t < windowMs);
  a.push(now); hits.set(k, a); return a.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, a] of hits) if (!a.some((t) => now - t < 60_000)) hits.delete(k); }, 120_000).unref();
const ipOf = (req: http.IncomingMessage) => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

const appendJsonl = (file: string, obj: unknown) => fs.appendFileSync(path.join(DATA, file), JSON.stringify({ at: new Date().toISOString(), ...(obj as object) }) + '\n');
const okEmail = (s: unknown) => typeof s === 'string' && s.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const clean = (s: unknown, max = 2000) => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);

async function hook(url: string | undefined, payload: unknown) {
  if (!url) return;
  try { await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }); } catch (e) { log('hook failed', url.slice(0, 40), String(e)); }
}
async function mail(subject: string, text: string, replyTo?: string) {
  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO) return;
  try {
    await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM || 'no-reply@localhost', to: env.ENQUIRY_TO.split(',').map((s) => s.trim()), subject, text, reply_to: replyTo }) });
  } catch (e) { log('mail failed', String(e)); }
}

/* ── catalogue (written by the build) ──────────────────────── */
let catCache: { t: number; m: number; v: any } | null = null;
function catalog() {
  const f = path.join(DIST, 'catalog.json');
  try {
    const m = fs.statSync(f).mtimeMs;
    if (!catCache || catCache.m !== m) catCache = { t: Date.now(), m, v: JSON.parse(fs.readFileSync(f, 'utf8')) };
    return catCache.v;
  } catch { return null; }
}

/* ── Stripe ────────────────────────────────────────────────── */
function form(obj: Record<string, unknown>, prefix = '', out: [string, string][] = []): [string, string][] {
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue; const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((x, i) => (typeof x === 'object' && x !== null ? form(x as any, `${key}[${i}]`, out) : out.push([`${key}[${i}]`, String(x)])));
    else if (typeof v === 'object') form(v as any, key, out);
    else out.push([key, String(v)]);
  }
  return out;
}
async function stripe(pathname: string, body?: Record<string, unknown>, method = body ? 'POST' : 'GET') {
  if (!env.STRIPE_SECRET_KEY) throw Object.assign(new Error('Checkout is not connected yet.'), { status: 503 });
  const r = await fetch(STRIPE + pathname, {
    method, headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
    body: body ? new URLSearchParams(form(body)).toString() : undefined
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) { log('stripe error', r.status, j?.error?.message); throw Object.assign(new Error('Checkout could not be started. Please try again in a moment.'), { status: 502, detail: j?.error?.message }); }
  return j;
}

async function checkout(req: http.IncomingMessage, res: http.ServerResponse) {
  const body = await readJson(req);
  const cat = catalog(); if (!cat) return json(res, 503, { error: 'The shop is not ready yet.' });
  if (cat.demo && !String(env.STRIPE_SECRET_KEY || '').startsWith('sk_test_')) return json(res, 503, { error: 'This build shows sample prices and cannot take real orders.' });
  const items: { id: string; qty: number; opts: Record<string, string> }[] = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  if (!items.length) return json(res, 400, { error: 'Your bag is empty.' });
  const lines: any[] = []; const meta: Record<string, string> = {};
  for (const [n, it] of items.entries()) {
    const p = cat.products[clean(it.id, 40)]; const qty = Math.round(Number(it.qty));
    if (!p || !(qty >= 1 && qty <= 9)) return json(res, 400, { error: 'Something in your bag is no longer available.' });
    if (p.cents == null && !p.priceId) return json(res, 422, { error: `${p.code} // ${p.name} has no price yet — remove it from the bag to continue.` });
    const opts = Object.entries(it.opts && typeof it.opts === 'object' ? it.opts : {}).slice(0, 8).map(([k, v]) => `${clean(k, 30)}: ${clean(v, 60)}`).join(', ');
    meta[`item_${n + 1}`] = `${p.id} x${qty}${opts ? ' | ' + opts : ''}`.slice(0, 480);
    lines.push(p.priceId
      ? { price: p.priceId, quantity: qty }
      : { quantity: qty, price_data: { currency: (cat.currency || 'EUR').toLowerCase(), unit_amount: p.cents, product_data: { name: `${p.code} // ${p.name}`, description: opts || p.sub || undefined, metadata: { cfc_code: p.id } } } });
  }
  const countries = (env.SHIPPING_COUNTRIES || 'DE,AT,CH,FR,IT,NL,BE,ES,GB,US').split(',').map((s) => s.trim()).filter(Boolean);
  const rates = (env.STRIPE_SHIPPING_RATES || '').split(',').map((s) => s.trim()).filter(Boolean);
  const session = await stripe('/v1/checkout/sessions', {
    mode: 'payment', line_items: lines, metadata: meta,
    success_url: `${SITE}/bag/thank-you/?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${SITE}/bag/`,
    shipping_address_collection: { allowed_countries: countries }, billing_address_collection: 'auto', phone_number_collection: { enabled: true },
    ...(rates.length ? { shipping_options: rates.map((r) => ({ shipping_rate: r })) } : {}),
    ...(env.STRIPE_AUTOMATIC_TAX === '1' ? { automatic_tax: { enabled: true } } : {}),
    allow_promotion_codes: true, locale: 'auto'
  });
  json(res, 200, { url: session.url });
}

function verifyStripe(raw: Buffer, header: string | undefined) {
  const secret = env.STRIPE_WEBHOOK_SECRET; if (!secret || !header) return false;
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=') as [string, string]));
  const t = Number(parts.t); if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const exp = crypto.createHmac('sha256', secret).update(`${t}.${raw.toString('utf8')}`).digest('hex');
  return header.split(',').filter((x) => x.startsWith('v1=')).some((x) => { const a = Buffer.from(x.slice(3)), b = Buffer.from(exp); return a.length === b.length && crypto.timingSafeEqual(a, b); });
}
let rebuildT: NodeJS.Timeout | undefined;
async function webhook(req: http.IncomingMessage, res: http.ServerResponse) {
  const raw = await readBody(req, 1024 * 1024);
  if (!verifyStripe(raw, req.headers['stripe-signature'] as string | undefined)) return json(res, 400, { error: 'bad signature' });
  const ev = JSON.parse(raw.toString('utf8'));
  json(res, 200, { received: true });
  try {
    if (ev.type === 'checkout.session.completed') {
      const s = ev.data.object;
      const order = { id: s.id, email: s.customer_details?.email, name: s.customer_details?.name, amount: s.amount_total, currency: s.currency, items: s.metadata, shipping: s.shipping_details ?? s.collected_information?.shipping_details };
      appendJsonl('orders.jsonl', order); log('order', s.id, s.amount_total);
      await hook(env.ORDER_WEBHOOK_URL, order);
      await mail(`New order ${s.id}`, JSON.stringify(order, null, 2), s.customer_details?.email);
    } else if (/^(product|price)\.(created|updated|deleted)$/.test(ev.type) && env.REBUILD_HOOK_URL) {
      clearTimeout(rebuildT); rebuildT = setTimeout(() => { log('rebuild hook'); hook(env.REBUILD_HOOK_URL, { reason: ev.type }); }, 30_000);
    }
  } catch (e) { log('webhook handler', String(e)); }
}

/* ── forms ─────────────────────────────────────────────────── */
async function enquire(req: http.IncomingMessage, res: http.ServerResponse) {
  const b = await readJson(req);
  if (b.company) return json(res, 200, { ok: true });                       // honeypot
  const name = clean(b.name, 120), email = clean(b.email, 200), message = clean(b.message, 4000);
  if (!name || !okEmail(email)) return json(res, 400, { error: 'Please enter your name and a valid e-mail address.' });
  if (b.subject !== 'original' && message.length < 3) return json(res, 400, { error: 'Please write a few words.' });
  const rec = { name, email, message, work: clean(b.work, 200), subject: clean(b.subject, 40), ip: ipOf(req) };
  appendJsonl('enquiries.jsonl', rec);
  await mail(`Enquiry${rec.work ? ' — ' + rec.work : ''} (${rec.subject || 'general'})`, `${name} <${email}>\n\n${message}`, email);
  json(res, 200, { ok: true });
}
async function newsletter(req: http.IncomingMessage, res: http.ServerResponse) {
  const b = await readJson(req);
  if (b.company) return json(res, 200, { ok: true });
  const email = clean(b.email, 200); if (!okEmail(email)) return json(res, 400, { error: 'Please enter a valid e-mail address.' });
  appendJsonl('newsletter.jsonl', { email }); await hook(env.NEWSLETTER_WEBHOOK_URL, { email });
  json(res, 200, { ok: true });
}

/* ── static files ──────────────────────────────────────────── */
const zcache = new Map<string, { m: number; br: Buffer; gz: Buffer }>();
function serveStatic(req: http.IncomingMessage, res: http.ServerResponse, pathname: string) {
  let rel = decodeURIComponent(pathname);
  if (rel.includes('\0') || rel.includes('..')) return send(res, 400, 'Bad request');
  let file = path.join(DIST, rel);
  let st: fs.Stats | null = null; try { st = fs.statSync(file); } catch { /* */ }
  if (st?.isDirectory()) {
    if (!rel.endsWith('/')) { res.writeHead(301, { location: rel + '/' + (req.url!.includes('?') ? req.url!.slice(req.url!.indexOf('?')) : ''), ...SEC }); return res.end(); }
    file = path.join(file, 'index.html'); try { st = fs.statSync(file); } catch { st = null; }
  }
  if (!st || !st.isFile()) {
    const nf = path.join(DIST, '404.html');
    const body = fs.existsSync(nf) ? fs.readFileSync(nf) : Buffer.from('Not found');
    return send(res, 404, body, { 'content-type': MIME['.html'], 'cache-control': 'no-cache' });
  }
  const ext = path.extname(file).toLowerCase();
  const headers: Record<string, string> = { 'content-type': MIME[ext] || 'application/octet-stream', 'last-modified': st.mtime.toUTCString() };
  const isAsset = rel.startsWith('/assets/'), isImg = rel.startsWith('/images/'), isFont = rel.startsWith('/fonts/');
  headers['cache-control'] = isAsset ? 'public, max-age=31536000, immutable' : isImg || isFont ? 'public, max-age=86400' : 'no-cache';
  if (req.headers['if-modified-since'] && new Date(req.headers['if-modified-since']).getTime() >= Math.floor(st.mtimeMs / 1000) * 1000 && !DEV) { res.writeHead(304, { ...SEC, ...headers }); return res.end(); }
  const ae = String(req.headers['accept-encoding'] || '');
  if (COMPRESS.has(ext) && st.size > 600 && /\b(br|gzip)\b/.test(ae)) {
    let z = zcache.get(file);
    if (!z || z.m !== st.mtimeMs) { const raw = fs.readFileSync(file); z = { m: st.mtimeMs, br: zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }), gz: zlib.gzipSync(raw, { level: 6 }) }; if (zcache.size > 400) zcache.clear(); zcache.set(file, z); }
    const useBr = /\bbr\b/.test(ae);
    return send(res, 200, useBr ? z.br : z.gz, { ...headers, 'content-encoding': useBr ? 'br' : 'gzip', vary: 'Accept-Encoding' });
  }
  if (req.method === 'HEAD') { res.writeHead(200, { ...SEC, ...headers, 'content-length': String(st.size) }); return res.end(); }
  res.writeHead(200, { ...SEC, ...headers, 'content-length': String(st.size) });
  fs.createReadStream(file).pipe(res);
}

/* ── dev: live reload ──────────────────────────────────────── */
const clients = new Set<http.ServerResponse>();
if (DEV) fs.watchFile(path.join(DIST, '.stamp'), { interval: 250 }, () => { for (const c of clients) c.write('data: reload\n\n'); });

/* ── server ────────────────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://x'); const p = url.pathname;
  try {
    if (p.startsWith('/api/')) {
      if (p === '/api/health') return json(res, 200, { ok: true, stripe: !!env.STRIPE_SECRET_KEY, webhook: !!env.STRIPE_WEBHOOK_SECRET, catalog: !!catalog() });
      if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
      if (p === '/api/stripe-webhook') return await webhook(req, res);
      if (limited(ipOf(req), p, p === '/api/checkout' ? 15 : 6)) return json(res, 429, { error: 'Too many requests. Please wait a minute.' });
      if (p === '/api/checkout') return await checkout(req, res);
      if (p === '/api/enquire') return await enquire(req, res);
      if (p === '/api/newsletter') return await newsletter(req, res);
      return json(res, 404, { error: 'Not found' });
    }
    if (DEV && p === '/__dev.js') return send(res, 200, "new EventSource('/__events').onmessage=function(){location.reload()}", { 'content-type': MIME['.js'], 'cache-control': 'no-store' });
    if (DEV && p === '/__events') { res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' }); res.write('retry: 500\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return; }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    serveStatic(req, res, p);
  } catch (e: any) {
    const status = e?.status || 500; if (status >= 500) log('error', p, e?.stack || String(e));
    if (!res.headersSent) json(res, status, { error: status < 500 ? e.message : 'Something went wrong. Please try again.' }); else res.end();
  }
});
server.listen(PORT, () => log(`C. ( ) C. — ${SITE}  (port ${PORT}${DEV ? ', dev' : ''})  stripe:${env.STRIPE_SECRET_KEY ? 'on' : 'off'}`));
for (const sig of ['SIGINT', 'SIGTERM'] as const) process.on(sig, () => { server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 3000).unref(); });
