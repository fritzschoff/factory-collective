'use client';

import { useEffect } from 'react';
import { useBagWrite } from '@/lib/bag/store';

/** On the thank-you page: the order is placed, the bag is emptied. */
export function ClearBag() {
  const { clear } = useBagWrite();
  useEffect(() => { clear(); }, [clear]);
  return null;
}
