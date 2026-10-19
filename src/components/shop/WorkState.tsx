'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useInBagToast } from '@/components/chrome/Toast';
import { useBagWrite } from '@/lib/bag/store';
import { cx } from '@/lib/cx';
import type { ProductSummary } from '@/lib/products/summary';
import { useHydrated } from '@/lib/use-hydrated';

const ADDED_MS = 1600;
const RADIO_NAME = 'lpstate';

interface WorkStateValue { state: string | null; setState: (s: string) => void }
const WorkState = createContext<WorkStateValue>({ state: null, setState: () => {} });

/** The state (01 – 03) a Layer Paintings print is made from — shared by the picker and the Add buttons. */
export function WorkStateProvider({ initial, children }: { initial: string | null; children: ReactNode }) {
  const [state, setState] = useState(initial);
  return <WorkState.Provider value={{ state, setState }}>{children}</WorkState.Provider>;
}

export function StatePick({ options }: { options: { value: string; label: string; image: ReactNode; sub: ReactNode }[] }) {
  const { state, setState } = useContext(WorkState);
  return (
    <fieldset className="pick" aria-label="State for the print">
      {options.map((o) => (
        <label key={o.value}>
          <input type="radio" name={RADIO_NAME} value={o.value} checked={state === o.value} onChange={() => setState(o.value)} />
          {o.image}
          <p className="micro ink">{o.label}</p>
          <span className="sub">{o.sub}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function EditionAdd({ product, needsState }: { product: ProductSummary; needsState: boolean }) {
  const { state: picked } = useContext(WorkState);
  const { add } = useBagWrite();
  const inBag = useInBagToast();
  const hydrated = useHydrated();
  const [msg, setMsg] = useState('');
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = () => {
    // "Added ✓" disables the button; this also covers a double click
    if (added) return;
    // the state shown checked: one clicked before hydration moved the radios on the page while React kept the old one
    const state = document.querySelector<HTMLInputElement>(`input[name="${RADIO_NAME}"]:checked`)?.value ?? picked;
    if (needsState && !state) {
      setMsg('Choose a state first.');
      document.getElementById('states')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setMsg('');
    add(product.id, needsState && state ? { state: { v: state, l: `State 0${state}` } } : {});
    inBag(product);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), ADDED_MS);
  };

  return (
    <>
      <button className="pill pill--ghost" type="button" disabled={!hydrated} aria-disabled={added || undefined} onClick={onClick}>{added ? 'Added  ✓' : needsState ? 'Choose a state · Add' : 'Add to bag'}</button>
      <p className={cx('buy__msg', msg && 'is-err')} role="status">{msg}</p>
    </>
  );
}
