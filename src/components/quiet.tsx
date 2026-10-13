import type { ReactNode } from 'react';
import { Kick, Micro, Narrate, TitleBlock, Crumb, cx, Raw } from './ui';
import { SITE } from '../content/site';
import { ctx } from '../lib/runtime';

const today = () => { const d = new Date(ctx.generatedAt || Date.now()); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`; };

/** The opening of a quiet page: kicker, title, one sentence on a dash-dot line. */
export function QOpen({ kick, meta, title, sub, children }: { kick: ReactNode; meta?: ReactNode; title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <header className="q-open">
      <div className="q-open__row"><Kick>{kick}</Kick>{meta && <Micro className="q-open__meta">{meta}</Micro>}</div>
      <h1 className="title q-title">{title}</h1>
      {sub && <p className="q-sub">{sub}</p>}
      {children && <div className="q-narr"><Narrate>{children}</Narrate></div>}
    </header>
  );
}
export const QCap = ({ l, r }: { l?: ReactNode; r?: ReactNode }) => <div className="q-cap"><p className="micro ink">{l}</p><p className="micro">{r}</p></div>;
export const Sp = ({ s = 'l', children, className, id }: { s?: 's' | 'm' | 'l' | 'xl'; children?: ReactNode; className?: string; id?: string }) => <div className={cx(`sp-${s}`, className)} id={id}>{children}</div>;

/** the sheet at the foot of a quiet page: title block + a cross-reference + breadcrumb */
export function QEnd({ sheet, index, thesis, scale = '1 : 1', cf, crumb, date, project = SITE.name }: { sheet: string; index: string; thesis?: string; scale?: string; cf?: ReactNode; crumb?: { label: string; href?: string }[]; date?: string; project?: string }) {
  return (
    <div className="q-end">
      <div className="q-end__row">
        <TitleBlock rows={[[['Sheet', sheet], ['Index', index]], [['Thesis', thesis ?? '—'], ['Scale', scale]], [['Project', project], ['Date', date ?? today()]]]} />
        {cf && <p className="q-end__cf">{cf}</p>}
      </div>
      {crumb && <Crumb items={crumb} />}
    </div>
  );
}
export const Tx = ({ paras }: { paras: string[] }) => <div className="tx">{paras.map((t, i) => <Raw key={i} as="p" html={t.replace(/\*([^*]+)\*/g, '<i>$1</i>')} />)}</div>;
