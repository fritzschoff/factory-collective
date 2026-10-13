import type { CSSProperties, ReactNode } from 'react';
import type { Product } from '../lib/types';
import { price, WORKS } from '../content/catalog';
import { Img, Rule, cx } from './ui';

/** the quick "Add" — opens the option picker (size, colour …) or adds directly */
export const AddLink = ({ p, children = 'Add' }: { p: Product; children?: ReactNode }) =>
  p.kind === 'print' && p.options.length ? <a className="link-u" href={p.href}>Choose &amp; add</a> : <button type="button" data-quickadd={p.id}>{children}</button>;

/** product tile: picture, code // name, material, price, Add */
export function Tile({ p, ratio = '4/5', w = 340, sub, tag, pos, className, eager, sizes, ground }: { p: Product; ground?: boolean; ratio?: string; w?: number; sub?: ReactNode; tag?: string; pos?: string; className?: string; eager?: boolean; sizes?: string }) {
  return (
    <article className={cx('tile', className)} data-id={p.id}>
      {(tag ?? p.tag) && <span className="tile__tag">{tag ?? p.tag}</span>}
      <a className="tile__a" href={p.href} aria-label={`${p.code} ${p.name}`}>
        <Img slot={p.images[0]} ratio={ratio} pos={pos ?? p.pos} w={w} ground={ground ?? p.ground} alt={`${p.code} — ${p.name}`} eager={eager} sizes={sizes ?? '(min-width:1440px) 340px, (min-width:700px) 25vw, 50vw'} />
      </a>
      <p className="tile__t"><b>{p.code}</b> // {p.name}</p>
      <p className="tile__s">{sub ?? p.material}</p>
      <p className="tile__b"><span>{price(p)}</span><AddLink p={p} /></p>
    </article>
  );
}

/** a gap in the inventory: red, dashed, empty brackets */
export function ComingTile({ title, line, ratio = '4/5', cta = 'Notify me' }: { title: string; line: string; ratio?: string; cta?: string }) {
  return (
    <article className="tile tile--coming">
      <div className="tile__ph" style={{ '--r': ratio } as CSSProperties}><span>( )</span></div>
      <p className="tile__t"><b>{title}</b></p>
      <p className="tile__s">{line}</p>
      <p className="tile__b"><span /><a className="link-u" href="/contact/?subject=notify">{cta}</a></p>
    </article>
  );
}

/** a rail of tiles under a ruled title */
export function Rail({ title, note, right, items, ratio = '17/21', w = 340, className }: { title: string; note?: ReactNode; right?: ReactNode; items: (Product | { coming: boolean; title: string; line: string })[]; ratio?: string; w?: number; className?: string }) {
  const cols = items.length;
  return (
    <section className={cx('rail', className)} aria-label={title}>
      <Rule title={title} note={note} right={right} />
      <div className={cx(cols === 3 ? 'g3' : cols === 5 ? 'g5' : 'g4')}>
        {items.map((it, i) => 'coming' in it ? <ComingTile key={i} title={it.title} line={it.line} ratio={ratio} /> : <Tile key={it.id} p={it} ratio={ratio} w={w} />)}
      </div>
    </section>
  );
}

/** quiet-page plate row: picture in the 768 column, one line beside it, the price at its foot */
export function PlateRow({ slot, ratio = '768/900', pos, ground, code, line, price: pr, cta, href, product, mark, buy = true, w = 768, alt }: {
  slot: string; ratio?: string; pos?: string; ground?: boolean; code: ReactNode; line: ReactNode; price?: string; cta?: string; href?: string; product?: Product; mark?: ReactNode; buy?: boolean; w?: number; alt?: string;
}) {
  return (
    <div className="prow">
      <a className="prow__img" href={product?.href ?? href} tabIndex={product || href ? 0 : -1}><Img slot={slot} ratio={ratio} pos={pos} ground={ground} w={w} alt={alt ?? ''} sizes="(min-width:1440px) 768px, (min-width:900px) 53vw, 100vw" /></a>
      <div className="prow__side">
        <div><p className="micro prow__code">{code}</p><p className="prow__line">{line}</p></div>
        {mark && <div className="prow__mark">{mark}</div>}
        {buy && (
          <p className="prow__buy">
            {product ? <><span>{price(product)}</span> <AddLink p={product} /></> : <><span>{pr ?? '€ [price]'}</span> {href ? <a className="link-u" href={href}>{cta ?? 'View'}</a> : null}</>}
          </p>
        )}
      </div>
    </div>
  );
}

/** index grid on quiet pages: codes + price (+ Add) under each picture */
export function IndexGrid({ items, cols = 5, ratio = '1/1.2', add = true }: { items: Product[]; cols?: 4 | 5; ratio?: string; add?: boolean }) {
  return (
    <div className={cols === 5 ? 'g5' : 'g4'}>
      {items.map((p) => (
        <article className="tile tile--idx" key={p.id}>
          <a className="tile__a" href={p.href}><Img slot={p.images[0]} ratio={ratio} pos={p.pos} ground={p.ground} w={230} alt={`${p.code} — ${p.name}`} sizes="(min-width:1440px) 230px, 40vw" /></a>
          <p className="micro tile__c"><b>{p.code}</b><span>{price(p)}</span></p>
          <p className="tile__s">{p.name}{add && <> &nbsp; <AddLink p={p} /></>}</p>
        </article>
      ))}
    </div>
  );
}

/** a work's own thumbnail (art) */
export function WorkIdx({ w, slot, ratio = '3/4', from }: { w: { code: string; href: string }; slot: string; ratio?: string; from: string }) {
  return (
    <article className="tile tile--idx">
      <a className="tile__a" href={w.href}><Img slot={slot} ratio={ratio} w={230} alt={w.code} sizes="(min-width:1440px) 230px, 40vw" /></a>
      <p className="micro tile__c"><b>{w.code}</b><span>from {from}</span></p>
      <p className="tile__s"><a href={w.href}>→ the work page</a></p>
    </article>
  );
}
export { WORKS };
