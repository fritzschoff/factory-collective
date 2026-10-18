'use client';

import { useEffect } from 'react';
import { useBag } from '@/lib/bag/store';

/** On the thank-you page: the order is placed, the bag is emptied. */
export function ClearBag() {
  const { clear } = useBag();
  useEffect(() => { clear(); }, [clear]);
  return null;
}
