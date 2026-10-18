'use client';

import { useState, type ReactNode } from 'react';

/** All / Jackets / Shirts … — hides the other groups; the address keeps the choice as #jackets. */
export function FashionFilter({ groups, total, children }: { groups: { id: string; label: string; n: number }[]; total: number; children: ReactNode }) {
  const [active, setActive] = useState('all');
  const choose = (id: string) => {
    setActive(id);
    window.history.replaceState(null, '', id === 'all' ? window.location.pathname : `#${id}`);
  };
  return (
    <div data-filter={active}>
      <div className="sp-m">
        <div className="filters" role="toolbar" aria-label="Filter">
          <span>
            <button type="button" className={active === 'all' ? 'is-on' : undefined} aria-pressed={active === 'all'} onClick={() => choose('all')}>All ( {total} )</button>
            {groups.map((g) => (
              <button key={g.id} type="button" className={active === g.id ? 'is-on' : undefined} aria-pressed={active === g.id} onClick={() => choose(g.id)}>{g.label} ( {g.n} )</button>
            ))}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
