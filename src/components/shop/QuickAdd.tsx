'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useInBagToast } from '@/components/chrome/Toast';
import type { BagOptions } from '@/lib/bag/items';
import { useBag } from '@/lib/bag/store';
import { cx } from '@/lib/cx';
import { fmtPrice } from '@/lib/format';
import { defaultValueIndex } from '@/lib/products/options';
import type { ProductSummary } from '@/lib/products/summary';
import { useHydrated } from '@/lib/use-hydrated';

/** "Add" on a tile: adds at once, or first asks for size, colour … in a small box. */
export function QuickAddButton({ product, label = 'Add' }: { product: ProductSummary; label?: string }) {
  const { add } = useBag();
  const hydrated = useHydrated();
  const inBag = useInBagToast();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const choices = product.options.filter((o) => o.type !== 'text');

  if (product.kind === 'print' && product.options.length) {
    return <Link className="link-u" href={product.href}>Choose &amp; add</Link>;
  }
  const commit = (opts: BagOptions) => {
    add(product.id, opts);
    inBag(product);
    setOpen(false);
  };
  return (
    <>
      <button
        ref={button}
        type="button"
        disabled={!hydrated}
        aria-haspopup={choices.length ? 'dialog' : undefined}
        aria-expanded={choices.length ? open : undefined}
        onClick={() => (choices.length ? setOpen((o) => !o) : commit({}))}
      >
        {label}
      </button>
      {open && <QuickAddBox anchor={button} product={product} onAdd={commit} onClose={close} />}
    </>
  );
}

function QuickAddBox({ anchor, product, onAdd, onClose }: { anchor: RefObject<HTMLButtonElement | null>; product: ProductSummary; onAdd: (o: BagOptions) => void; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const choices = product.options.filter((o) => o.type !== 'text');
  const [picked, setPicked] = useState<Record<string, number>>(() => Object.fromEntries(choices.map((o) => [o.id, defaultValueIndex(o)])));

  // place the box under the button, right-aligned; above it when there is no room below
  useLayoutEffect(() => {
    const a = anchor.current?.getBoundingClientRect();
    const el = box.current;
    if (!a || !el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    el.style.left = `${Math.max(12, Math.min(window.innerWidth - w - 12, a.right - w))}px`;
    el.style.top = `${a.bottom + h + 12 > window.innerHeight ? Math.max(12, a.top - h - 8) : a.bottom + 8}px`;
    el.style.visibility = 'visible';
    // The box sits at the end of the page in tab order, so it takes focus when it opens: its first choice. A hidden
    // element cannot be focused, so this has to come after the line above; and it must not scroll, any scroll closes the box.
    el.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
  }, [anchor]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!box.current?.contains(t) && !anchor.current?.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { onClose(); anchor.current?.focus(); } };
    // Focus moved to another control, outside the box and its button: close. No related target means focus went to
    // no element at all (a press on the box's padding or on a button the browser does not focus on press, the window
    // losing focus, Tab leaving the page): that is not a move to another control, so the box stays.
    const onFocusOut = (e: FocusEvent) => {
      const to = e.relatedTarget;
      if (to instanceof Node && !box.current?.contains(to) && !anchor.current?.contains(to)) onClose();
    };
    const start = window.scrollY;
    const onScroll = () => { if (Math.abs(window.scrollY - start) > 48) onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusout', onFocusOut);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('scroll', onScroll);
    };
  }, [anchor, onClose]);

  const submit = () => {
    onAdd(Object.fromEntries(choices.map((o) => {
      const v = o.values![picked[o.id]];
      return [o.id, { v: v.id, l: v.label }];
    })));
    // the box goes away with the focused button in it: hand focus back to where the buyer came from
    anchor.current?.focus();
  };

  return createPortal(
    <div ref={box} className="qa" role="dialog" aria-label={`Choose and add ${product.code}`} style={{ visibility: 'hidden' }}>
      <div className="qa__h"><b>{product.code}</b><span>{fmtPrice(product.priceCents)}</span></div>
      {choices.map((o) => (
        <div className="qa__o" key={o.id}>
          <span>{o.label}</span>
          <div className="qa__c">
            {(o.values ?? []).map((v, i) => (
              <button key={v.id} type="button" className={cx('chip', picked[o.id] === i && 'is-on')} aria-pressed={picked[o.id] === i} onClick={() => setPicked((p) => ({ ...p, [o.id]: i }))}>{v.label}</button>
            ))}
          </div>
        </div>
      ))}
      <button className="pill" type="button" onClick={submit}>Add to bag</button>
    </div>,
    document.body,
  );
}
