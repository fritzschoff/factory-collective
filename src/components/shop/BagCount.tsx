'use client';

import { useBag } from '@/lib/bag/store';

/** The number in "Bag ( n )". */
export function BagCount() {
  const { count } = useBag();
  return <>{count}</>;
}
