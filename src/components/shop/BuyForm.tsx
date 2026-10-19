'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { expandVariants, optionRole, skuFor, variantKey, type ShopOption } from '@cfc/shop-core/sku';
import { useInBagToast } from '@/components/chrome/Toast';
import { A } from '@/components/link';
import { getApi } from '@/lib/api';
import type { BagOptions } from '@/lib/bag/items';
import { useBag } from '@/lib/bag/store';
import { cx } from '@/lib/cx';
import { defaultValueIndex } from '@/lib/products/options';
import type { ProductSummary } from '@/lib/products/summary';
import type { OptionDef } from '@/lib/types';
import { useHydrated } from '@/lib/use-hydrated';

const ADDED_MS = 1600;

function shopOptions(options: readonly OptionDef[]): ShopOption[] {
  return options.map((option) => ({ ...option, role: option.role ?? optionRole(option.id) }));
}

function defaults(options: readonly OptionDef[]): Record<string, string> {
  const picked: Record<string, string> = {};
  for (const option of options) {
    const values = option.values ?? [];
    if (!values.length) continue;
    picked[option.id] = values[defaultValueIndex(option)]?.id ?? values[0].id;
  }
  return picked;
}

function stockOf(product: ProductSummary, items: Record<string, { available: number | null }> | null, picked: Record<string, string>, optionId: string, valueId: string): number | null | undefined {
  if (!items) return undefined;
  const selected = { ...picked, [optionId]: valueId };
  const sku = skuFor(product.id, variantKey(shopOptions(product.options), selected));
  return items[sku]?.available;
}

function allSoldOut(product: ProductSummary, items: Record<string, { available: number | null }> | null): boolean {
  if (!items) return false;
  const variants = expandVariants(shopOptions(product.options));
  if (!variants.length) return false;
  return variants.every((variant) => {
    const available = items[skuFor(product.id, variant.key)]?.available;
    return typeof available === 'number' && available <= 0;
  });
}

/** The buy form of a product page: options, Add to bag, the note under it. */
export function BuyForm({ product, note }: { product: ProductSummary; note: string }) {
  const { add } = useBag();
  const inBag = useInBagToast();
  const hydrated = useHydrated();
  const [added, setAdded] = useState(false);
  const [picked, setPicked] = useState<Record<string, string>>(() => defaults(product.options));
  const [stock, setStock] = useState<Record<string, { available: number | null }> | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    let stop = false;
    getApi<{ items: Record<string, { available: number | null }> }>('availability', { ids: product.id })
      .then((data) => { if (!stop) setStock(data.items); })
      .catch(() => { if (!stop) setStock(null); });
    return () => { stop = true; };
  }, [product.id]);

  const soldOut = allSoldOut(product, stock);
  const selectedSku = skuFor(product.id, variantKey(shopOptions(product.options), picked));
  const left = stock?.[selectedSku]?.available;
  const chosenGone = typeof left === 'number' && left <= 0;
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (added || soldOut || chosenGone) return;
    const data = new FormData(e.currentTarget);
    const opts: BagOptions = {};
    for (const o of product.options) {
      const raw = String(data.get(o.id) ?? '').trim();
      if (!raw) continue;
      if (o.type === 'text') { opts[o.id] = { v: raw, l: raw.toUpperCase() }; continue; }
      const v = o.values?.find((x) => x.id === raw);
      if (v) opts[o.id] = { v: v.id, l: v.label };
    }
    add(product.id, opts);
    inBag(product);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), ADDED_MS);
  };

  return (
    <form className="buy__form" noValidate onSubmit={onSubmit}>
      {product.options.map((o) => (
        <OptionField key={o.id} o={o} product={product} picked={picked} stock={stock} onPick={(id) => setPicked((prev) => ({ ...prev, [o.id]: id }))} />
      ))}
      {soldOut ? (
        <>
          <button className="pill pill--block" type="button" disabled>Sold out</button>
          <p className="buy__note"><A href="/contact/?subject=notify">Notify me</A></p>
        </>
      ) : (
        <button className="pill pill--block" type="submit" disabled={added || !hydrated || chosenGone}>{added ? 'Added  ✓' : 'Add to bag'}</button>
      )}
      <p className="buy__note">{note}</p>
      <p className="buy__msg" role="status">{typeof left === 'number' && left > 0 && left <= 3 ? `Only ${left} left` : ''}</p>
    </form>
  );
}

function OptionField({ o, product, picked, stock, onPick }: { o: OptionDef; product: ProductSummary; picked: Record<string, string>; stock: Record<string, { available: number | null }> | null; onPick: (id: string) => void }) {
  if (o.type === 'text') {
    return (
      <fieldset className="opt opt--text">
        <legend className="micro">{o.label}</legend>
        <label><input type="text" name={o.id} maxLength={o.max} placeholder="Optional" autoComplete="off" /><span>{o.note}</span></label>
      </fieldset>
    );
  }
  const values = o.values ?? [];
  const current = picked[o.id] ?? values[defaultValueIndex(o)]?.id;
  return (
    <fieldset className={cx('opt', `opt--${o.type}`)}>
      <legend className="micro">{o.label}</legend>
      <div className="opt__v">
        {values.map((v) => {
          const available = optionRole(o.id) === 'variant' ? stockOf(product, stock, picked, o.id, v.id) : undefined;
          const dead = typeof available === 'number' && available <= 0;
          return (
            <label key={v.id} className={cx('opt__c', dead && 'is-sold')}>
              <input type="radio" name={o.id} value={v.id} defaultChecked={current === v.id} disabled={dead} aria-label={v.label} onChange={() => onPick(v.id)} />
              {o.type === 'swatch' && <i className="opt__sw" style={{ background: v.swatch }} />}
              <span>{v.label}</span>
            </label>
          );
        })}
        {o.type === 'size' && o.note && <SizeGuideLink />}
      </div>
    </fieldset>
  );
}

/** Opens the Measurements accordion and scrolls to it. */
function SizeGuideLink() {
  return (
    <a
      className="opt__guide"
      href="#acc-measurements"
      onClick={(e) => {
        const d = document.getElementById('acc-measurements');
        if (d instanceof HTMLDetailsElement) { e.preventDefault(); d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }}
    >
      Size guide&nbsp;&nbsp;→
    </a>
  );
}
