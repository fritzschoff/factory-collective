import type { CSSProperties, ReactNode } from 'react';
import { A } from '@/components/link';
import { QuickAddButton } from '@/components/shop/QuickAdd';
import { Img } from '@/components/ui/img';
import { mediaUrl } from '@/lib/images';
import { Rule } from '@/components/ui/text';
import { cx } from '@/lib/cx';
import { fmtPrice } from '@/lib/format';
import { toSummary } from '@/lib/products/summary';
import type { Product } from '@/lib/types';

/** The quick "Add": opens the option box, adds directly, or sends prints to their work page. */
export const AddLink = ({ p, label }: { p: Product; label?: string }) => <QuickAddButton product={toSummary(p)} label={label} />;

/** Product tile: picture, code // name, material, price, Add. */
export function Tile({ p, ratio = '4/5', w = 340, sub, tag, pos, className, eager, sizes, ground }: { p: Product; ground?: boolean; ratio?: string; w?: number; sub?: ReactNode; tag?: string; pos?: string; className?: string; eager?: boolean; sizes?: string }) {
  return (
    <article className={cx('tile', className)} data-id={p.id}>
      {(tag ?? p.tag) && <span className="tile__tag">{tag ?? p.tag}</span>}
      <A className="tile__a" href={p.href} aria-label={`${p.code} ${p.name}`}>
        <Img slot={p.images[0]} src={mediaUrl(p.media, p.images[0])} ratio={ratio} pos={pos ?? p.pos} w={w} ground={ground ?? p.ground} alt={`${p.code} — ${p.name}`} eager={eager} sizes={sizes ?? '(min-width:1440px) 340px, (min-width:700px) 25vw, 50vw'} />
      </A>
      <p className="tile__t"><b>{p.code}</b>{' // '}{p.name}</p>
      <p className="tile__s">{sub ?? p.material}</p>
      <p className="tile__b"><span>{fmtPrice(p.priceCents)}</span><AddLink p={p} /></p>
    </article>
  );
}

/** A gap in the inventory: red, dashed, empty brackets. */
export function ComingTile({ title, line, ratio = '4/5', cta = 'Notify me' }: { title: string; line: string; ratio?: string; cta?: string }) {
  return (
    <article className="tile tile--coming">
      <div className="tile__ph" style={{ '--r': ratio } as CSSProperties}><span>( )</span></div>
      <p className="tile__t"><b>{title}</b></p>
      <p className="tile__s">{line}</p>
      <p className="tile__b"><span /><A className="link-u" href="/contact/?subject=notify">{cta}</A></p>
    </article>
  );
}

/** A rail of tiles under a ruled title. */
export function Rail({ title, note, right, items, ratio = '17/21', w = 340, className }: { title: string; note?: ReactNode; right?: ReactNode; items: (Product | { coming: boolean; title: string; line: string })[]; ratio?: string; w?: number; className?: string }) {
  return (
    <section className={cx('rail', className)} aria-label={title}>
      <Rule title={title} note={note} right={right} />
      <div className={cx(items.length === 3 ? 'g3' : items.length === 5 ? 'g5' : 'g4')}>
        {items.map((it, i) => ('coming' in it ? <ComingTile key={i} title={it.title} line={it.line} ratio={ratio} /> : <Tile key={it.id} p={it} ratio={ratio} w={w} />))}
      </div>
    </section>
  );
}

/** Quiet-page row: the picture in the 768 column, one line beside it, the price at its foot. */
export function PlateRow({ slot, ratio = '768/900', pos, ground, code, line, price: pr, cta, href, product, mark, buy = true, w = 768, alt }: {
  slot: string; ratio?: string; pos?: string; ground?: boolean; code: ReactNode; line: ReactNode; price?: string; cta?: string; href?: string; product?: Product; mark?: ReactNode; buy?: boolean; w?: number; alt?: string;
}) {
  const to = product?.href ?? href;
  const pic = <Img slot={slot} src={mediaUrl(product?.media, slot)} ratio={ratio} pos={pos} ground={ground} w={w} alt={alt ?? ''} sizes="(min-width:1440px) 768px, (min-width:900px) 53vw, 100vw" />;
  return (
    <div className="prow">
      {to ? <A className="prow__img" href={to}>{pic}</A> : <span className="prow__img">{pic}</span>}
      <div className="prow__side">
        <div><p className="micro prow__code">{code}</p><p className="prow__line">{line}</p></div>
        {mark && <div className="prow__mark">{mark}</div>}
        {buy && (
          <p className="prow__buy">
            {product
              ? <><span>{fmtPrice(product.priceCents)}</span> <AddLink p={product} /></>
              : <><span>{pr ?? '€ [price]'}</span> {href ? <A className="link-u" href={href}>{cta ?? 'View'}</A> : null}</>}
          </p>
        )}
      </div>
    </div>
  );
}

/** Index grid on quiet pages: code + price (+ Add) under each picture. */
export function IndexGrid({ items, cols = 5, ratio = '1/1.2', add = true }: { items: Product[]; cols?: 4 | 5; ratio?: string; add?: boolean }) {
  return (
    <div className={cols === 5 ? 'g5' : 'g4'}>
      {items.map((p) => (
        <article className="tile tile--idx" key={p.id}>
          <A className="tile__a" href={p.href}><Img slot={p.images[0]} src={mediaUrl(p.media, p.images[0])} ratio={ratio} pos={p.pos} ground={p.ground} w={230} alt={`${p.code} — ${p.name}`} sizes="(min-width:1440px) 230px, 40vw" /></A>
          <p className="micro tile__c"><b>{p.code}</b><span>{fmtPrice(p.priceCents)}</span></p>
          <p className="tile__s">{p.name}{add && <> &nbsp; <AddLink p={p} /></>}</p>
        </article>
      ))}
    </div>
  );
}
