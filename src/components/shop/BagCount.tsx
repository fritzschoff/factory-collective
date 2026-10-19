'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useBag } from '@/lib/bag/store';

const Known = createContext<ReadonlySet<string> | null>(null);

export function BagCatalog({ ids, children }: { ids: readonly string[]; children: ReactNode }) {
  const known = useMemo(() => new Set(ids), [ids]);
  return <Known.Provider value={known}>{children}</Known.Provider>;
}

/** The number in "Bag ( n )". */
export function BagCount() {
  const { items } = useBag();
  const known = useContext(Known);
  const count = known ? items.reduce((sum, line) => sum + (known.has(line.id) ? line.qty : 0), 0) : items.reduce((sum, line) => sum + line.qty, 0);
  return <>{count}</>;
}
