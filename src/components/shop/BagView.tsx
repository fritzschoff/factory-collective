'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { optionRole, skuFor, variantKey, type ShopOption } from '@cfc/shop-core/sku';
import { ApiError, apiBase, getApi, postApi } from '@/lib/api';
import { MAX_QTY } from '@/lib/bag/items';
import { useBag } from '@/lib/bag/store';
import { cx } from '@/lib/cx';
import { fmtPrice } from '@/lib/format';
import type { ProductSummary } from '@/lib/products/summary';
import type { OptionDef } from '@/lib/types';
import { useHydrated } from '@/lib/use-hydrated';

function shopOptions(options: readonly OptionDef[]): ShopOption[] {
  return options.map((option) => ({ ...option, role: option.role ?? optionRole(option.id) }));
}

/** The bag: lines from localStorage, prices from the catalogue, checkout through the API (Phase 2). */
export function BagView({ products }: { products: Record<string, ProductSummary> }) {
  const { items, count, set } = useBag();
  // false in the server HTML and while the page hydrates, true once the browser has read the stored bag (Ruling P44)
  const read = useHydrated();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false); // the checkout request is on its way: further clicks are ignored
  const [live, setLive] = useState<Record<string, { priceCents: number | null; status: string }>>({});
  const [stock, setStock] = useState<Record<string, { available: number | null }>>({});
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const lines = items.flatMap((i) => (products[i.id] ? [{ i, p: products[i.id] }] : []));

  // A stored line whose product is gone from the catalogue is not shown — and, once the stored bag has been read, is
  // dropped from it, so the count in the header is right too.
  useEffect(() => {
    if (!read) return;
    for (const i of items) if (!products[i.id]) set(i.key, 0);
  }, [read, items, products, set]);

  useEffect(() => {
    if (!read || !apiBase()) return;
    let stop = false;
    const ids = [...new Set(items.map((item) => item.id))].join(',');
    Promise.all([
      getApi<{ products: { id: string; priceCents: number | null; status: string }[] }>('catalog'),
      ids ? getApi<{ items: Record<string, { available: number | null }> }>('availability', { ids }) : Promise.resolve({ items: {} }),
    ]).then(([catalog, availability]) => {
      if (stop) return;
      setLive(Object.fromEntries(catalog.products.map((product) => [product.id, { priceCents: product.priceCents, status: product.status }])));
      setStock(availability.items);
    }).catch(() => {});
    return () => { stop = true; };
  }, [read, items]);

  // The server cannot know what is stored: until the browser has read it, neither "empty" nor lines are shown.
  if (!read) {
    return (
      <div className="bag__cols">
        <div className="bag__list" aria-live="polite"><p className="bag__noscript">Loading your bag …</p></div>
      </div>
    );
  }
  if (!lines.length) {
    // as on the old site: the list column keeps its place, the summary is not shown
    return (
      <div className="bag__cols">
        <div className="bag__list">
          <div className="bag__empty"><p>Your bag is empty.</p><Link className="pill" href="/atelier/">Go to the Atelier&nbsp;&nbsp;→</Link></div>
        </div>
      </div>
    );
  }
  const priceOf = (id: string, fallback: number | null) => (id in live ? live[id].priceCents : fallback);
  const unpriced = lines.some(({ i, p }) => priceOf(i.id, p.priceCents) == null);
  const total = lines.reduce((sum, { i, p }) => sum + (priceOf(i.id, p.priceCents) ?? 0) * i.qty, 0);
  const blocked = (id: string, qty: number, opts: Record<string, string>, summary: ProductSummary): string => {
    const fresh = live[id];
    if (fresh && fresh.status !== 'active') return 'No longer available';
    if (fresh && summary.priceCents != null && fresh.priceCents !== summary.priceCents) return 'The price has changed';
    const available = stock[skuFor(id, variantKey(shopOptions(summary.options), opts))]?.available;
    if (typeof available === 'number' && available < qty) return available > 0 ? `Only ${available} left` : 'Sold out';
    if (rejected.has(id)) return 'Please review this piece';
    return '';
  };
  const checkout = async () => {
    if (busy || unpriced) return;
    setMsg('');
    setBusy(true);
    try {
      const r = await postApi<{ url: string }>('checkout', { items: lines.map(({ i }) => ({ id: i.id, qty: i.qty, opts: Object.fromEntries(Object.entries(i.opts).map(([k, v]) => [k, v.v])) })) });
      window.location.assign(r.url); // (assigning to location.href is refused by the React Compiler lint rules)
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setRejected(new Set(err instanceof ApiError ? err.rejected.map((line) => line.id) : []));
      setBusy(false);
    }
  };

  return (
    <div className="bag__cols">
      <div className="bag__list" aria-live="polite">
        {lines.map(({ i, p }) => {
          const note = blocked(i.id, i.qty, Object.fromEntries(Object.entries(i.opts).map(([k, v]) => [k, v.v])), p);
          const cents = priceOf(i.id, p.priceCents);
          return (
          <article className={cx('bi', note && 'is-bad')} key={i.key}>
            <Link className={cx('bi__img', p.ground && 'is-ground')} href={p.href}>
              {p.img && <Image src={p.img} alt="" fill sizes="160px" style={{ objectPosition: p.pos ?? '50% 50%' }} />}
            </Link>
            <div className="bi__t">
              <b>{p.code}</b>{' // '}{p.name}
              <span className="sub">{p.sub}</span>
              <span className="sub">{Object.entries(i.opts).map(([k, v]) => `${p.options.find((o) => o.id === k)?.label ?? (k === 'state' ? 'State' : k)}: ${v.l}`).join('\u00a0\u00a0·\u00a0\u00a0')}</span>
              <span className="bi__q">
                <button type="button" aria-label="One less" onClick={() => set(i.key, i.qty - 1)}>–</button>
                <span>{i.qty}</span>
                <button type="button" aria-label="One more" disabled={i.qty >= MAX_QTY} onClick={() => set(i.key, i.qty + 1)}>+</button>
              </span>
              <button type="button" className="bi__rm" onClick={() => set(i.key, 0)}>Remove</button>
            </div>
            <div className="bi__p">{cents == null ? '€ [price]' : fmtPrice(cents * i.qty)}<small>{note || p.lead}</small></div>
          </article>
          );
        })}
      </div>
      <aside className="sum" aria-label="Summary">
        <h2 className="sum__h">Summary</h2>
        <dl className="sum__rows">
          <div><dt>Subtotal ( {count} )</dt><dd>{unpriced ? '€ [price]' : fmtPrice(total)}</dd></div>
          <div><dt>Shipping</dt><dd>Calculated at checkout</dd></div>
          <div><dt>Duties</dt><dd>Calculated at checkout</dd></div>
        </dl>
        <p className="sum__t"><span>Total</span><b>{unpriced ? '€ [price]' : fmtPrice(total)}</b></p>
        <button className="pill pill--block" type="button" disabled={busy || unpriced} aria-busy={busy} onClick={checkout}>{busy ? 'One moment …' : 'Checkout'}</button>
        <p className="sum__n">Secure payment via Stripe&nbsp;&nbsp;·&nbsp;&nbsp;Free returns within 30 days</p>
        <p className="sum__e" role="alert">{msg || (unpriced ? 'This piece has no price yet.' : '')}</p>
        <div className="tb sum__tb" role="group" aria-label="Order slate"><div><span>Order</span><span>not yet</span></div><div><span>Pieces</span><span>{count}</span></div><div><span>Ships from</span><span>[ place ]</span></div><div><span>Repair</span><span>lifetime</span></div></div>
        <p className="sum__r"><span className="r">( )</span>&nbsp; Everything here is made after you order it.</p>
      </aside>
    </div>
  );
}
