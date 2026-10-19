import './options';
import { checkoutBodySchema, enquireSchema, newsletterSchema } from '@cfc/shop-core';
import type { Response } from 'express';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest, type Request } from 'firebase-functions/v2/https';
import Stripe from 'stripe';
import { db } from './admin';
import { applyCors, clientIp, rateLimit, sendJson } from './http';
import { availabilityFor, bookFromSession, orderBySession, publicProducts, quote, releaseReservation, releaseStale, reserve, saveEnquiry, saveNewsletter, stripeLineItems, type CheckoutSession, type Mailer } from './logic';
import { enquiryTo, listParam, mailFrom, resendKey, secretValue, shippingCountries, siteUrl, stripeAutomaticTax, stripeSecret, stripeShippingRates, stripeWebhookSecret } from './params';

const http = { cors: false, invoker: 'public' } as const;

function mailer(): Mailer | null {
  const key = secretValue(() => resendKey.value()) || process.env.RESEND_API_KEY || '';
  const from = mailFrom.value();
  const to = enquiryTo.value();
  if (!key || !from || !to) return null;
  return async (mail) => {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, subject: mail.subject, text: mail.text }),
    });
  };
}

function idempotencyKey(header: string | undefined): string {
  const value = (header ?? '').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : '';
}

export const catalog = onRequest(http, async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') { sendJson(res, 405, { error: 'Method not allowed.' }); return; }
  const products = await publicProducts(db());
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
  sendJson(res, 200, { products });
});

export const availability = onRequest(http, async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') { sendJson(res, 405, { error: 'Method not allowed.' }); return; }
  const ids = String(req.query.ids ?? '').split(',').map((id) => id.trim()).filter(Boolean);
  res.setHeader('Cache-Control', 'no-store');
  sendJson(res, 200, { items: await availabilityFor(db(), ids) });
});

export const checkout = onRequest({ ...http, secrets: [stripeSecret] }, async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed.' }); return; }
  if (!(await rateLimit(db(), clientIp(req), 'checkout', 15))) { sendJson(res, 429, { error: 'Please wait a moment and try again.' }); return; }
  const parsed = checkoutBodySchema.safeParse(req.body);
  if (!parsed.success) { sendJson(res, 400, { error: 'Please check your bag and try again.' }); return; }
  const products = new Map((await publicProducts(db())).map((product) => [product.id, product]));
  const quoted = quote(products, parsed.data.items);
  if (quoted.rejected.length) { sendJson(res, 409, { error: quoted.error, rejected: quoted.rejected }); return; }
  let reservationId = '';
  try {
    reservationId = await reserve(db(), quoted.lines);
  } catch (error) {
    if (error instanceof Error && error.name === 'ShopError' && 'status' in error && 'rejected' in error) {
      const shop = error as unknown as { message: string; status: number; rejected: unknown };
      sendJson(res, shop.status, { error: shop.message, rejected: shop.rejected });
      return;
    }
    throw error;
  }
  try {
    const stripe = new Stripe(secretValue(() => stripeSecret.value()) || process.env.STRIPE_SECRET_KEY || '');
    const countries = listParam(shippingCountries.value()) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];
    const rates = listParam(stripeShippingRates.value());
    const site = siteUrl.value().replace(/\/$/, '');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: stripeLineItems(quoted.lines),
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      metadata: { reservationId },
      shipping_address_collection: { allowed_countries: countries },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      automatic_tax: { enabled: stripeAutomaticTax.value() === 'true' },
      shipping_options: rates.length ? rates.map((rate) => ({ shipping_rate: rate })) : undefined,
      success_url: `${site}/bag/thank-you/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/bag/`,
    });
    if (!session.url) throw new Error('Stripe did not return a url.');
    await db().collection('reservations').doc(reservationId).update({ stripeSessionId: session.id });
    sendJson(res, 200, { url: session.url });
  } catch {
    await releaseReservation(db(), reservationId);
    sendJson(res, 502, { error: 'Checkout is not available right now.' });
  }
});

export const stripeWebhook = onRequest({ ...http, secrets: [stripeWebhookSecret, resendKey] }, async (req, res) => {
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed.' }); return; }
  const raw = req.rawBody;
  const signature = req.header('stripe-signature');
  if (!raw || !signature) { sendJson(res, 400, { error: 'Invalid signature.' }); return; }
  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(raw, signature, secretValue(() => stripeWebhookSecret.value()) || process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch {
    sendJson(res, 400, { error: 'Invalid signature.' });
    return;
  }
  const session = checkoutSession(event.data.object as Stripe.Checkout.Session);
  if (event.type === 'checkout.session.completed') await bookFromSession(db(), session, session.payment_status === 'paid' ? 'paid' : 'unpaid', mailer());
  else if (event.type === 'checkout.session.async_payment_succeeded') await bookFromSession(db(), session, 'paid', mailer());
  else if (event.type === 'checkout.session.async_payment_failed') await bookFromSession(db(), session, 'failed', mailer());
  else if (event.type === 'checkout.session.expired') await bookFromSession(db(), session, 'expired', mailer());
  sendJson(res, 200, { received: true });
});

export const order = onRequest(http, async (req, res) => {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') { sendJson(res, 405, { error: 'Method not allowed.' }); return; }
  const sessionId = String(req.query.session_id ?? '');
  res.setHeader('Cache-Control', 'no-store');
  if (!sessionId) { sendJson(res, 404, { error: 'Order not found.' }); return; }
  const found = await orderBySession(db(), sessionId);
  if (!found) { sendJson(res, 404, { error: 'Order not found.' }); return; }
  sendJson(res, 200, found);
});

function checkoutSession(session: Stripe.Checkout.Session): CheckoutSession {
  const details = session.customer_details;
  const address = details?.address;
  const mapped: Record<string, string | null> = {};
  if (address) {
    for (const [key, value] of Object.entries(address)) {
      if (value == null || typeof value === 'string') mapped[key] = value;
    }
  }
  const intent = session.payment_intent;
  return {
    id: session.id,
    payment_status: session.payment_status,
    customer_details: details ? { email: details.email, name: details.name, phone: details.phone, address: address ? mapped : null } : null,
    amount_total: session.amount_total,
    currency: session.currency,
    payment_intent: typeof intent === 'string' || intent == null ? intent : { id: intent.id },
  };
}

async function form(req: Request, res: Response, kind: 'enquire' | 'newsletter'): Promise<void> {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed.' }); return; }
  if (!(await rateLimit(db(), clientIp(req), 'form', 6))) { sendJson(res, 429, { error: 'Please wait a moment and try again.' }); return; }
  const key = idempotencyKey(req.header('idempotency-key'));
  if (kind === 'enquire') {
    const parsed = enquireSchema.safeParse(req.body);
    if (!parsed.success) { sendJson(res, 400, { error: 'Please enter your name and a valid e-mail address.' }); return; }
    await saveEnquiry(db(), parsed.data, key, mailer());
  } else {
    const parsed = newsletterSchema.safeParse(req.body);
    if (!parsed.success) { sendJson(res, 400, { error: 'Please enter a valid e-mail address.' }); return; }
    await saveNewsletter(db(), parsed.data, key, mailer());
  }
  sendJson(res, 200, { ok: true });
}

export const enquire = onRequest({ ...http, secrets: [resendKey] }, (req, res) => form(req, res, 'enquire'));
export const newsletter = onRequest({ ...http, secrets: [resendKey] }, (req, res) => form(req, res, 'newsletter'));

export const releaseReservations = onSchedule({ schedule: 'every 60 minutes', timeZone: 'Europe/Berlin' }, async () => {
  await releaseStale(db());
});

export { adminCreateUpload, adminGetOrder, adminGetProduct, adminListEnquiries, adminListNewsletter, adminListOrders, adminListProducts, adminListStock, adminRegisterImage, adminSaveProduct, adminSetOnHand, adminUpdateOrder, adminWhoami } from './calls';
