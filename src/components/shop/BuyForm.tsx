'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useChrome } from '@/components/chrome/ChromeProvider';
import type { BagOptions } from '@/lib/bag/items';
import { useBag } from '@/lib/bag/store';
import { cx } from '@/lib/cx';
import { defaultValueIndex } from '@/lib/products/options';
import type { ProductSummary } from '@/lib/products/summary';
import type { OptionDef } from '@/lib/types';

const ADDED_MS = 1600;

/** The buy form of a product page: options, Add to bag, the note under it. */
export function BuyForm({ product, note }: { product: ProductSummary; note: string }) {
  const { add } = useBag();
  const { showToast } = useChrome();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // "Added ✓" disables the button; this also covers Enter in the monogram field and a double click
    if (added) return;
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
    showToast(`${product.code} // ${product.name} is in your bag.`, { href: '/bag/', label: 'View bag  →' });
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), ADDED_MS);
  };

  return (
    <form className="buy__form" noValidate onSubmit={onSubmit}>
      {product.options.map((o) => <OptionField key={o.id} o={o} />)}
      <button className="pill pill--block" type="submit" disabled={added}>{added ? 'Added  ✓' : 'Add to bag'}</button>
      <p className="buy__note">{note}</p>
      {/* kept empty: the buy box spacing of the design counts this line (min-height 1.3em) */}
      <p className="buy__msg" role="status" />
    </form>
  );
}

function OptionField({ o }: { o: OptionDef }) {
  if (o.type === 'text') {
    return (
      <fieldset className="opt opt--text">
        <legend className="micro">{o.label}</legend>
        <label><input type="text" name={o.id} maxLength={o.max} placeholder="Optional" autoComplete="off" /><span>{o.note}</span></label>
      </fieldset>
    );
  }
  const values = o.values ?? [];
  const start = defaultValueIndex(o);
  return (
    <fieldset className={cx('opt', `opt--${o.type}`)}>
      <legend className="micro">{o.label}</legend>
      <div className="opt__v">
        {values.map((v, i) => (
          <label key={v.id} className="opt__c">
            <input type="radio" name={o.id} value={v.id} defaultChecked={i === start} aria-label={v.label} />
            {o.type === 'swatch' && <i className="opt__sw" style={{ background: v.swatch }} />}
            <span>{v.label}</span>
          </label>
        ))}
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
